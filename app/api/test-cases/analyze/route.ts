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
You are an expert QA Automation Engineer. Your task is to analyze E2E test logs and translate them into a clear, beautiful, and highly actionable summary report for developers.

# INCIDENT DATA
- **Execution Status:** ${body.status}
- **Primary Error Message:** ${body.error || "None"}

## RAW PLAYWRIGHT LOGS
\`\`\`text
${body.logs.join("\n")}
\`\`\`

# OUTPUT REQUIREMENTS
Generate a clean breakdown using the exact Markdown format below based on the execution status. Use simple, human-friendly language and keep it straight to the point.

${isPassed ? `
### ✨ Run Summary
[Provide a clear, 1-2 sentence high-level overview celebrating the successful run, specifying which flows or main routes were validated successfully.]

### 🚀 What Succeeded
[Bullet points highlighting the major checkpoints passed, key assertions validated, and any notable execution performance observations from the logs.]

### 💡 Optimization Insights (Optional)
[Provide any proactive tips for keeping this test efficient, such as avoiding unnecessary wait times, optimizing hooks, or maintaining selector stability.]
` : `
### 📝 Summary
[Provide a clear, 1-2 sentence high-level overview of what the test was trying to accomplish and its final status.]

### 🔍 Root Cause
[Identify exactly *why* this failure happened based on the logs (e.g., a network timeout, a missing environment variable, a flaky selector, or an actual application bug).]

### ❌ What Failed
[Bullet points specifying the precise line of code, assertion, or element locator where the execution stopped dead.]

### 💡 Suggested Fix
[Provide concrete, step-by-step instructions or a clean code snippet showing how the developer can resolve this specific issue in their Playwright configuration or test file.]
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