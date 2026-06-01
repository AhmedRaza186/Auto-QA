import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const prompt = `
You are a QA engineer.

Analyze these Playwright logs.

Status:
${body.status}

Error:
${body.error || "None"}

Logs:
${body.logs.join("\n")}

Return:

1. Simple Summary
2. Root Cause
3. What Failed
4. Suggested Fix

Write in simple human language.
`;

  const result = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });

  return NextResponse.json({
    analysis: result.text,
  });
}