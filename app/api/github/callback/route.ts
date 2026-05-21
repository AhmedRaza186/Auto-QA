import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
        return NextResponse.redirect(new URL('/workspace?error=code not found', req.url))
    }

    // Fix: pass data as the second argument, config as the third
    const res = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        code
    }, {
        headers: {
            Accept: 'application/json'
        }
    })

    const data = res.data
    console.log(data)
    const token = data.access_token
    
    if (!token) {
        return NextResponse.redirect(new URL('/workspace?error=token not found', req.url))
    }

    const redirect = NextResponse.redirect(new URL('/workspace', req.url))

    redirect.cookies.set('github_access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax'
    })

    return redirect
}
