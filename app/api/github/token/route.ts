import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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
    const origin = req.headers.get('origin');
    return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);
}

export async function GET(req:NextRequest) {
    const origin = req.headers.get('origin');
    const cookieStore = await cookies()
    const token = cookieStore.get('github_access_token')?.value

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
            const response = NextResponse.json({token: null});
            response.cookies.delete('github_access_token');
            return addCorsHeaders(response, origin);
        }
        return addCorsHeaders(NextResponse.json({token: token}), origin)
    }
}