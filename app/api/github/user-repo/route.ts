import { db, repositories } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { repoId, userId, repoName, full_name, private_, description, owner, language, html_url, default_branch } = await req.json();

const result = await db.insert(repositories).values({
    repoId,
    userId,
    name: repoName,
    full_name: full_name,
    private_: private_ ? 1 : 0,
    html_url: html_url,
    description,
    owner,
    default_branch: default_branch
}).returning();

return NextResponse.json(result[0]);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}