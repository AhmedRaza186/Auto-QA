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
    const origin = new URL(req.url).origin;
    console.log(`GitHub OAuth initiation origin: ${origin}`);
    
    // Dynamically derive the redirect URI based on the request origin to support
    // localhost, local network IP sharing, and production Vercel domain automatically.
    const redirectUri = `${origin}/api/github/callback`;
    console.log(`Setting OAuth redirect_uri: ${redirectUri}`);

    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        redirect_uri: redirectUri,
        scope: "repo read:user",
    });

    const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
    return addCorsHeaders(response, origin);
}