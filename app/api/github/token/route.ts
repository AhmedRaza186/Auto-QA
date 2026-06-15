import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL,
    'https://auto-qa-rouge.vercel.app',
];

function addCorsHeaders(response: NextResponse, origin?: string) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}

export async function OPTIONS(req: NextRequest) {
    const origin: string | undefined = req.headers.get('origin') ?? undefined;
    return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);
}

export async function GET(req:NextRequest) {
    const origin: string | undefined = req.headers.get('origin') ?? undefined;
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return addCorsHeaders(NextResponse.json({token: null}), origin)
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    const token = user?.githubToken

    if (!token) {
        return addCorsHeaders(NextResponse.json({token: null}), origin)
    }

    try {
        // Validate token
        await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return addCorsHeaders(NextResponse.json({token: token}), origin)
    } catch (error: any) {
        if (error.response?.status === 401) {
            if (email) {
                const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
                if (user) {
                    await db.update(users).set({ githubToken: null }).where(eq(users.id, user.id));
                }
            }
            return addCorsHeaders(NextResponse.json({token: null}), origin);
        }
        return addCorsHeaders(NextResponse.json({token: null}), origin)
    }
}