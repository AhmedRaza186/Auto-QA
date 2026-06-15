import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@/db";
import { TestCasesTable, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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
    content: decodedContent,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testCaseId } = body;

    if (!testCaseId) {
      return NextResponse.json(
        { error: "testCaseId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch test case
    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId))
      .limit(1);

    if (!testCase) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    if (testCase.status !== "failed") {
      return NextResponse.json(
        { error: "Only failed test cases can be resolved" },
        { status: 400 }
      );
    }

    // 2. Fetch user and verify credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(testCase.userId)))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cost = 150;
    if (user.credits < cost) {
      return NextResponse.json(
        { error: `Insufficient credits. Issue resolution requires ${cost} credits.` },
        { status: 402 }
      );
    }

    // 3. Retrieve GitHub Token
    const [githubUser] = await db.select().from(users).where(eq(users.id, Number(testCase.userId))).limit(1)
    const githubToken = githubUser?.githubToken

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub authentication token is missing or expired" },
        { status: 401 }
      );
    }

    // 4. Fetch target files contents from GitHub
    const targetFiles = testCase.targetFiles || [];
    if (targetFiles.length === 0) {
      return NextResponse.json(
        { error: "No target files associated with this test case to repair" },
        { status: 400 }
      );
    }

    // Update state in DB to generating
    await db
      .update(TestCasesTable)
      .set({ fixStatus: "generating", fixError: null })
      .where(eq(TestCasesTable.id, testCaseId));

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

    const validFiles = fileContents.filter(Boolean) as { path: string; content: string }[];

    if (validFiles.length === 0) {
      const errorMsg = "Could not retrieve target files contents from GitHub.";
      await db
        .update(TestCasesTable)
        .set({ fixStatus: "failed", fixError: errorMsg })
        .where(eq(TestCasesTable.id, testCaseId));

      return NextResponse.json({ error: errorMsg }, { status: 404 });
    }

    // 5. Build prompt context
    const sourceContext = validFiles
      .map(
        (file) => `
File Path: ${file.path}

File Content:
\`\`\`
${file.content}
\`\`\`
`
      )
      .join("\n\n----------------------\n\n");

    const prompt = `
You are an expert Staff Software Engineer, QA Architect, and AI Code Repair Specialist.
Your task is to fix a bug in the repository codebase that causes the following test case to fail.

### TEST CASE DETAILS
- Title: ${testCase.title}
- Description: ${testCase.description}
- Route: ${testCase.targetRoute || "/"}
- Expected Result: ${testCase.expectedResult}

### TEST AUTOMATION SCRIPT
\`\`\`javascript
${testCase.playwrightScript || "No script available"}
\`\`\`

### FAILURE EXECUTION LOGS
\`\`\`
${(testCase.logs || []).join("\n")}
\`\`\`

### SOURCE FILES CONTEXT
Below are the contents of the relevant files in the repository. Inspect them carefully to locate the bug causing the failure.
${sourceContext}

### INSTRUCTIONS:
1. Identify the root cause of the test failure from the script and the execution logs.
2. Locate the file and line(s) in the provided Source Files Context that need to be changed.
3. Formulate a code fix. The fix must be correct, production-grade, and minimal.
4. Output a JSON object containing:
   - "fixAnalysis": A detailed explanation of the bug root cause and how the proposed changes resolve it.
   - "proposedChanges": An array of objects. Each object must contain:
     - "filePath": The relative path of the file being modified (must match one of the target files exactly).
     - "newContent":
- Make the minimum possible code change.
- Preserve existing formatting.
- Preserve all imports and exports.
- Do not rewrite unrelated code.
- Do not refactor code.
- Only fix the root cause of the failing test.
- Never modify more files than necessary.
5. DO NOT modify files that are not present in the provided Source Files Context.
`;

    // 6. Request Gemini structured fix
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fixAnalysis: {
              type: Type.STRING,
            },
            proposedChanges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  filePath: {
                    type: Type.STRING,
                  },
                  newContent: {
                    type: Type.STRING,
                  },
                },
                required: ["filePath", "newContent"],
              },
            },
          },
          required: ["fixAnalysis", "proposedChanges"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    const fixAnalysis = result.fixAnalysis || "";
    const rawChanges = result.proposedChanges || [];

    // 7. Security: Validate proposed file paths against targetFiles list to prevent unauthorized directory writes
    const sanitizedChanges: { filePath: string; originalContent: string; newContent: string }[] = [];
    for (const change of rawChanges) {
      const isTarget = targetFiles.includes(change.filePath);
      const fileObj = validFiles.find((f) => f.path === change.filePath);
      
      if (isTarget && fileObj) {
        sanitizedChanges.push({
          filePath: change.filePath,
          originalContent: fileObj.content,
          newContent: change.newContent,
        });
      } else {
        console.warn(`AI suggested modifying unauthorized or non-existent file: ${change.filePath}`);
      }
    }

    if (sanitizedChanges.length === 0) {
      const errorMsg = "Gemini proposed no valid changes to the whitelisted target files.";
      await db
        .update(TestCasesTable)
        .set({ fixStatus: "failed", fixError: errorMsg })
        .where(eq(TestCasesTable.id, testCaseId));

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Deduct user credits
    const newCredits = user.credits - cost;
    await db.update(users).set({ credits: newCredits }).where(eq(users.id, user.id));

    // 8. Update DB with proposed fix
    await db
      .update(TestCasesTable)
      .set({
        fixStatus: "generated",
        fixAnalysis,
        fixProposedChanges: sanitizedChanges,
        fixError: null,
      })
      .where(eq(TestCasesTable.id, testCaseId));

    return NextResponse.json({
      success: true,
      fixStatus: "generated",
      fixAnalysis,
      proposedChanges: sanitizedChanges,
      credits: newCredits,
    });
  } catch (error: any) {
    console.error("Failed to generate AI fix:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during fix generation",
      },
      { status: 500 }
    );
  }
}
