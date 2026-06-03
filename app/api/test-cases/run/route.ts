import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable, repositories, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
// Import from 'playwright' instead of 'playwright-core' for local launching
import { chromium } from "playwright";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

async function readGithubFile({
    owner,
    repo,
    path,
    branch,
    githubToken,
}: {
    owner: string;
    repo: string;
    path: string;
    branch: string;
    githubToken: string;
}) {
    const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github+json",
            },
        }
    );

    if (!res.ok) {
        return null;
    }

    const data = await res.json();

    if (!data.content) {
        return null;
    }

    const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

    return {
        path,
        content: decodedContent.slice(0, 15000),
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { testCaseId, baseUrl, backendUrl, mode = "generate", customPrompt = "" } = body;

        if (!testCaseId || !baseUrl) {
            return NextResponse.json(
                { error: "testCaseId and baseUrl are required" },
                { status: 400 }
            );
        }

        // 1. Fetch test case from DB
        const [testCase] = await db
            .select()
            .from(TestCasesTable)
            .where(eq(TestCasesTable.id, testCaseId));

        if (!testCase) {
            return NextResponse.json({ error: "Test case not found" }, { status: 404 });
        }

        // Fetch user and check credits
        const [user] = await db.select().from(users).where(eq(users.id, Number(testCase.userId)));
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (user.credits < 100) {
            return NextResponse.json(
                { error: "Insufficient credits to run test case. Minimum 100 required." },
                { status: 402 }
            );
        }

        // Fetch repository settings for global instructions
        let repoRecord = null;
        if (testCase.repoId) {
            const [r] = await db
                .select()
                .from(repositories)
                .where(eq(repositories.repoId, parseInt(testCase.repoId)));
            repoRecord = r;
        }
        if (!repoRecord) {
            const [r] = await db
                .select()
                .from(repositories)
                .where(eq(repositories.full_name, `${testCase.repoOwner}/${testCase.repoName}`));
            repoRecord = r;
        }

        let scriptText = testCase.playwrightScript;
        const forceRegenerate = mode === "generate" || !scriptText;
        let creditDeduction = 70; // Default flat rate for execution

        // 2. Generate script using Gemini if forced, or if no script is cached
        if (forceRegenerate) {
            const cookiesStore = await cookies();
            const githubToken = cookiesStore.get("github_access_token")?.value;

            if (!githubToken) {
                return NextResponse.json(
                    { error: "GitHub authentication token is missing or expired" },
                    { status: 401 }
                );
            }

            // Fetch target files context
            const targetFiles = testCase.targetFiles || [];
            let repoContext = "";

            if (targetFiles.length > 0) {
                const fileContents = await Promise.all(
                    targetFiles.map((path) =>
                        readGithubFile({
                            owner: testCase.repoOwner,
                            repo: testCase.repoName,
                            branch: testCase.branch || "main",
                            path,
                            githubToken,
                        })
                    )
                );

                const validFiles = fileContents.filter(Boolean);
                repoContext = validFiles
                    .map(
                        (file: any) => `
                            File Path: ${file.path}

                            File Content:
                            ${file.content}
                            `
                    )
                    .join("\n\n----------------------\n\n");
            }

            // Build global instructions and runtime prompts
            const globalIns = repoRecord?.gloablInstruction
                ? `\n[GLOBAL PROJECT INSTRUCTIONS] (Follow strictly):\n${repoRecord.gloablInstruction}\n`
                : "";

            const targetUrl = backendUrl?.trim()
                ? `${backendUrl.trim()}${testCase.targetRoute || ""}`
                : `${baseUrl.trim()}${testCase.targetRoute || ""}`;

            const tempIns = customPrompt
                ? `\n[ADDITIONAL RUNTIME INSTRUCTIONS] (Follow strictly):\n${customPrompt}\n`
                : "";

            // Prompt Gemini for Playwright code string
            const prompt = `
You are an expert QA automation engineer.
Your task is to write a Playwright Node.js script body that executes a test case on an application running at URL: "${targetUrl}".

Test Case Details:
- Title: ${testCase.title}
- Description: ${testCase.description}
- Target Route: ${testCase.targetRoute || "/"}
- Expected Result: ${testCase.expectedResult}
${backendUrl ? `- Backend API URL: ${backendUrl}\n` : ''}${globalIns}
${tempIns}

Source File Context for Reference (Read this to extract exact tags, component text, input fields, and class names):
${repoContext || "No source file context available for this test case."}

Write only the JavaScript code that executes within an async function context.

The following variables are pre-injected into your runtime environment:
1. 'page': The Playwright Page object.
2. 'console': The custom console object to output log messages.

IMPORTANT:
- Do NOT assume Node.js 'assert' is available.
- Do NOT import assert or any other module.
- At the top of the generated script, always define this custom assert helper:

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

Rules for your code:
1. DO NOT import playwright, browserbase, assert, or any other modules.
2. Navigate to the target route using: 
   \`await page.goto('${targetUrl}', { waitUntil: 'load', timeout: 15000 })\`
   followed by a short settle wait: \`await page.waitForTimeout(10000)\`.
3. Carefully analyze the Source File Context provided to find the EXACT forms, inputs, placeholders, buttons, and elements. Look for:
   - Input names, placeholder texts, or labels (e.g. \`page.getByPlaceholder('Enter your name')\` or \`page.locator('input[name="email"]')\`).
   - Button texts (e.g. \`page.getByRole('button', { name: /submit/i })\` or \`page.locator('button:has-text("Submit")')\`).
4. Apply extreme selector resilience:
   - If a specific selector or locator might fail, use flexible text-matching locators or check multiple variations.
   - ALWAYS wait for an element to be visible before interacting with it: \`await page.waitForSelector('selector-or-text', { state: 'visible', timeout: 40000 }).catch(() => {})\`.
   - Scroll elements into view before interaction to prevent out-of-bounds clicks: \`await locator.scrollIntoViewIfNeeded().catch(() => {})\`.
   - If standard click fails or throws a timeout, try forcing it or using DOM-based dispatch click as a safe backup:
     \`await locator.click({ force: true, timeout: 20000 }).catch(async () => { await locator.evaluate(node => node.click()).catch(() => {}) })\`
5. Introduce generous settling times:
   - Add \`await page.waitForTimeout(10000)\` after major actions (clicks, inputs, typing, form submissions) to allow React, Next.js, or server state updates to propagate and elements to render.
6. Use lenient, substring-based assertions:
   - Do NOT use strict case-sensitive equality matches on text contents.
   - Instead, search for presence or substring content in a relaxed, case-insensitive way. E.g.:
     \`const bodyText = await page.innerText('body');\`
     \`assert(bodyText.toLowerCase().includes('${testCase?.expectedResult?.toLowerCase().replace(/'/g, "\\'")}'), 'Expected result state not matched');\`
   - Or assert visibility of key success elements instead of exact string matching.
7. Print descriptive logs at each step using \`console.log()\` to make debugging a breeze for the user.
8. Return ONLY the raw JavaScript executable code.
9. DO NOT wrap the code in markdown code blocks like \`\`\`javascript or \`\`\`.
10. DO NOT include any explanation.
11. Just return the executable code.

BACKEND API DISCOVERY RULES:

1. You MUST inspect the provided repository source files carefully before writing any API request.

2. NEVER assume or invent routes like:
- /api/auth/login
- /api/auth/register
- /login
- /signup
or any other common endpoint.

3. ONLY use routes that are explicitly defined in:
- Express routers
- route files
- app.js
- server.js
- index.js
- Next.js route handlers
- controller mappings

4. First identify:
- base router prefixes
- mounted routers
- actual endpoint paths
- HTTP methods

5. If authentication APIs are not present in repository context:
- DO NOT generate fake login/register flows
- DO NOT create imaginary JWT tokens
- DO NOT assume auth exists

6. If required routes are missing from context:
throw new Error(
  "Required API routes were not found in repository context"
);

7. Before generating requests:
- inspect imported routers
- inspect app.use(...)
- inspect router.post(...)
- inspect router.get(...)
- inspect router.put(...)
- inspect router.delete(...)

8. Prefer exact real routes from source code over assumptions.

9. If the test case is backend/API related:
- prioritize page.request
- do NOT navigate frontend unnecessarily

10. Never guess request body fields.
Only use fields actually found in:
- validation schemas
- mongoose schemas
- prisma models
- zod schemas
- controllers
- frontend forms
`;

            const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
            });

            const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
            if (tokensUsed > 0) {
                creditDeduction = Math.min(100, 70 + Math.floor(tokensUsed / 100));
            }

            let generatedCode = response.text || "";
            // Clean up any stray markdown wrappers just in case
            generatedCode = generatedCode.replace(/^```javascript\s*/i, "");
            generatedCode = generatedCode.replace(/^```js\s*/i, "");
            generatedCode = generatedCode.replace(/```$/, "");
            generatedCode = generatedCode.trim();

            if (!generatedCode) {
                return NextResponse.json(
                    { error: "Gemini failed to generate an automation script" },
                    { status: 500 }
                );
            }

            // Validate that the generated content looks like a script and not an HTML page
            if (generatedCode.trim().startsWith('<!DOCTYPE') || generatedCode.trim().startsWith('<html')) {
                // Return an error response – the script is clearly not valid JavaScript
                return NextResponse.json(
                    { error: "Gemini returned HTML instead of a script – likely a page error" },
                    { status: 500 }
                );
            }
            scriptText = generatedCode;
            // Save the generated script immediately to database
            await db
                .update(TestCasesTable)
                .set({
                    playwrightScript: scriptText,
                    status: "running",
                })
                .where(eq(TestCasesTable.id, testCase.id));
        } else {
            // 3. Mark database status as running
            await db
                .update(TestCasesTable)
                .set({ status: "running" })
                .where(eq(TestCasesTable.id, testCase.id));
        }

        let browser: any = null;
        let isCancelled = false;
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const sendStream = (data: any) => {
                    if (isCancelled) return;
                    try {
                        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
                    } catch (e) {
                        // ignore if stream controller is already closed
                    }
                };

                const logs: string[] = [];

                const customConsole = {
                    log: (...args: any[]) => {
                        const line = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        logs.push(line);
                        sendStream({ type: "log", message: line });
                    },
                    error: (...args: any[]) => {
                        const line = `[ERROR] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        logs.push(line);
                        sendStream({ type: "log", message: line });
                    },
                    warn: (...args: any[]) => {
                        const line = `[WARN] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        logs.push(line);
                        sendStream({ type: "log", message: line });
                    }
                };

                try {
                    if (isCancelled) throw new Error("Execution aborted by client cancellation.");

                    // Define AsyncFunction constructor for validation (allows top‑level await)
                    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
                    // Validate syntax before launching browser to fail early
                    try {
                        new AsyncFunction("page", "assert", "console", scriptText);
                    } catch (syntaxError: any) {
                        throw new Error("Generated script has syntax error: " + syntaxError.message);
                    }

                    // 4. Create local Playwright session
                    const msgStart = `[SYSTEM] Starting local Playwright browser...`;
                    logs.push(msgStart);
                    sendStream({ type: "log", message: msgStart });

                    if (isCancelled) throw new Error("Execution aborted by client cancellation.");

                    // Launch browser
                    browser = await chromium.launch({ headless: true });

                    if (isCancelled) {
                        await browser.close().catch(() => {});
                        browser = null;
                        throw new Error("Execution aborted by client cancellation.");
                    }

                    const context = await browser.newContext();
                    const page = await context.newPage();

                    // 6. Listen to Browser Console Events
                    page.on("console", (msg: any) => {
                        const line = `[BROWSER] [${msg.type().toUpperCase()}] ${msg.text()}`;
                        logs.push(line);
                        sendStream({ type: "log", message: line });
                    });

                    const msgLaunch = `[SYSTEM] Browser launched successfully, executing script...`;
                    logs.push(msgLaunch);
                    sendStream({ type: "log", message: msgLaunch });

                    if (isCancelled) throw new Error("Execution aborted by client cancellation.");

                    // 7. Compile and run script
                    const runFn = new AsyncFunction("page", "assert", "console", scriptText);

                    // Mock assertion helper for runtime container if script assumes assert is global
                    const assertHelper = (condition: boolean, message?: string) => {
                        if (!condition) {
                            throw new Error(message || "Assertion failed");
                        }
                    };

                    await runFn(page, assertHelper, customConsole);

                    const msgComplete = `[SYSTEM] Script execution completed successfully without errors.`;
                    logs.push(msgComplete);
                    sendStream({ type: "log", message: msgComplete });

                    // 8. Clean up session and browser
                    await page.close().catch(() => { });
                    await browser.close().catch(() => { });
                    browser = null;

                    // 9. Update DB Status to passed
                    await db
                        .update(TestCasesTable)
                        .set({
                            status: "passed",
                            playwrightScript: scriptText,
                            logs,
                        })
                        .where(eq(TestCasesTable.id, testCase.id));

                    // 10. Deduct credits
                    const newCredits = user.credits - creditDeduction;
                    await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

                    sendStream({
                        type: "result",
                        success: true,
                        status: "passed",
                        logs,
                        error: null,
                        playwrightScript: scriptText,
                        credits: newCredits,
                    });
                } catch (execError: any) {
                    console.error("Script execution error:", execError);

                    const msgFail = `[SYSTEM ERROR] Script execution failed: ${execError.message || String(execError)}`;
                    logs.push(msgFail);
                    sendStream({ type: "log", message: msgFail });

                    // Clean up session and browser if still active
                    if (browser) {
                        await browser.close().catch(() => { });
                        browser = null;
                    }

                    // 10. Update DB Status to failed
                    await db
                        .update(TestCasesTable)
                        .set({
                            status: "failed",
                            playwrightScript: scriptText,
                            logs,
                        })
                        .where(eq(TestCasesTable.id, testCase.id));

                    // 11. Deduct credits
                    const newCredits = user.credits - creditDeduction;
                    await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

                    sendStream({
                        type: "result",
                        success: false,
                        status: "failed",
                        logs,
                        error: execError.message || String(execError),
                        playwrightScript: scriptText,
                        credits: newCredits,
                    });
                } finally {
                    // Always close browser if still opened
                    if (browser) {
                        await browser.close().catch(() => { });
                        browser = null;
                    }
                    try {
                        controller.close();
                    } catch (e) {
                        // ignore if already closed
                    }
                }
            },
            cancel() {
                isCancelled = true;
                if (browser) {
                    browser.close().catch(() => { });
                    browser = null;
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "application/x-ndjson",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("API endpoint error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
