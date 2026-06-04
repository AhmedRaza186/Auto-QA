import { db, repositories } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const clerkUser = await currentUser();
        const email = clerkUser?.primaryEmailAddress?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { repoId, userId, repoName, full_name, private_, description, owner, language, html_url, default_branch } = await req.json();

        if (Number(userId) !== dbUser.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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
            userId: dbUser.id,
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
    return NextResponse.json(result)
}