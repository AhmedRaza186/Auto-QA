import { NextResponse } from "next/server";

export async function GET() {
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        redirect_uri: process.env.REDIRECT_URI!,
        scope: "repo read:user",
    });

    return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}