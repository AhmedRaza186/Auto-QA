import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = 'force-dynamic';

export async function GET(req:NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('github_access_token')?.value

    if (!token) {
        return NextResponse.json({token: null})
    }

    try {
        // Validate token
        await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return NextResponse.json({token: token})
    } catch (error: any) {
        if (error.response?.status === 401) {
            const response = NextResponse.json({token: null});
            response.cookies.delete('github_access_token');
            return response;
        }
        return NextResponse.json({token: token})
    }
}