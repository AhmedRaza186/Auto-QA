import { db, repositories } from "@/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { repoId, userId, repoName, full_name, private_, description, owner, language, html_url, default_branch } = await req.json();

        const existingRepo = await db.select().from(repositories).where(
            and(
                eq(repositories.userId, userId),
                eq(repositories.repoId, repoId)
            )
        ).limit(1);

        if (existingRepo.length > 0) {
            return NextResponse.json(
                { error: "Repository already added" },
                { status: 400 }
            );
        }

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

export async function GET(req:NextRequest){
    const {searchParams} =new URL (req.url)
    const userIdParam = searchParams.get("userId")
    if (!userIdParam || userIdParam === "undefined") {
        return NextResponse.json({error: "userId is required"}, {status: 400})
    }
    const userId = Number(userIdParam)
    if (isNaN(userId)) {
        return NextResponse.json({error: "Invalid userId"}, {status: 400})
    }
    
    const result = await db.select().from(repositories).where(eq(repositories.userId, userId))
    console.log(result)
    return NextResponse.json(result)
}