import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();

 const isPassed = body.status === "passed" || !body.error;

  const prompt = `
# SYSTEM ROLE
You are a helpful assistant. Your task is to analyze execution logs and translate them into a clear, beautiful, and human-friendly explanation of what happened.

# HUMAN-FRIENDLY ANALYSIS RULES
1. Always write for a non-technical user.
2. Use simple, natural, human-readable language.
3. Never mention internal tools, frameworks, automation engines, scripts, browser automation libraries, testing frameworks, or implementation details.
4. Never use technical terms unless absolutely necessary. If a technical term must be used, explain it in plain language.
5. Focus on:
   - What happened
   - Why it happened
   - What the impact is
   - How the user can fix it
6. Do not describe how the system performed the analysis.
7. Do not mention code execution, automated testing processes, browser automation, selectors, locators, scripts, or technical infrastructure.
8. Present findings as observations rather than internal execution details.

## FORBIDDEN TERMS (NEVER MENTION OR REFERENCE):
- Playwright
- Browser automation libraries
- Testing frameworks
- Selectors
- Locators
- Scripts
- Internal execution details
- Automation engine names
- Technical infrastructure names

The user should feel that a helpful assistant reviewed the situation and is explaining it in plain language, not that an automation tool generated the result.

## FAILURE EXPLANATION STYLE
- Instead of: "The test failed because the automation could not locate the submit button."
  Write: "The Submit button could not be found on the page. This may happen if the button is missing, hidden, disabled, or takes too long to appear."
- Instead of: "The script timed out after waiting for the element."
  Write: "The page took longer than expected to load the required content."

## RECOMMENDATION STYLE
Always provide:
- Clear explanation
- Likely cause
- Suggested solution
- Next steps
- Example: "I found an issue during the checkout process. The payment step could not be completed because required information was missing. Verify that all mandatory fields are filled correctly and try again."

## USER INSTRUCTIONS RULE
If the user needs to change settings, configuration, prompts, rules, or options:
- Never mention internal tools or framework names.
- Simply say: "Open the Options/Instructions section and paste the following instructions." or "Add the following rule to your existing instructions."

# INCIDENT DATA
- **Execution Status:** ${body.status}
- **Primary Error Message:** ${body.error || "None"}

## RAW EXECUTION LOGS
\`\`\`text
${body.logs.join("\n")}
\`\`\`

# OUTPUT REQUIREMENTS
Generate a clean breakdown using the exact Markdown format below based on the execution status. Use simple, human-friendly language and keep it straight to the point.

${isPassed ? `
### ✨ Run Summary
[Provide a clear, 1-2 sentence high-level overview celebrating the successful run, specifying which flows or main sections were validated successfully, using plain language.]

### 🚀 What Succeeded
[Bullet points highlighting the major milestones or checkpoints passed, and positive user-facing observations, without mentioning selectors or automation code.]

### 💡 Optimization Insights (Optional)
[Provide any proactive tips for keeping the experience fast, smooth, and robust for the user.]
` : `
### 📝 Summary
[Provide a clear, 1-2 sentence high-level overview of what we tried to accomplish and its status in simple terms.]

### 🔍 Root Cause
[Identify exactly *why* this issue happened based on the logs, explaining it in simple user-friendly terms without mentioning technical terms or selectors.]

### ❌ What Failed
[Bullet points specifying the precise step or element where the process stopped, written as a user observation.]

### 💡 Suggested Fix
[Provide concrete, step-by-step instructions showing how the user can resolve this issue, e.g. updating options, changing page flow, or checking configuration. If they need to change instructions, tell them to open the Options/Instructions section and paste/add the instruction.]
`}
`;

  const result = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });

  return NextResponse.json({
    analysis: result.text,
  });
}