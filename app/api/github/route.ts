import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const origin = new URL(req.url).origin;
    const redirectUri = process.env.REDIRECT_URI || `${origin}/api/github/callback`;

    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        redirect_uri: redirectUri,
        scope: "repo read:user",
    });

    return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}