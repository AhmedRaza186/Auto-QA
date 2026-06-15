import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL,
    'https://auto-qa-rouge.vercel.app',
];

function addCorsHeaders(response: NextResponse, origin?: string | null) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);
}

export async function GET(req: NextRequest) {
    const origin = req.headers.get('origin');
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
        return addCorsHeaders(NextResponse.redirect(new URL('/workspace?error=code not found', req.url)), origin)
    }

    const requestOrigin = new URL(req.url).origin;
    const redirectUri = `${requestOrigin}/api/github/callback`;

    // Fix: pass data as the second argument, config as the third, including the matching redirect_uri
    const res = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        code,
        redirect_uri: redirectUri
    }, {
        headers: {
            Accept: 'application/json'
        }
    })

    const data = res.data
    const token = data.access_token
    
    if (!token) {
        return addCorsHeaders(NextResponse.redirect(new URL('/workspace?error=token not found', req.url)), origin)
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;

    if (!email) {
        return addCorsHeaders(NextResponse.redirect(new URL('/workspace?error=unauthorized', req.url)), origin)
    }

    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
        await db.update(users).set({ githubToken: token }).where(eq(users.id, existingUser.id));
    } else {
        await db.insert(users).values({
            name: clerkUser?.fullName ?? "New User",
            email,
            githubToken: token,
        });
    }

    const redirect = NextResponse.redirect(new URL('/workspace?github=connected', req.url))

    return addCorsHeaders(redirect, origin)
}
