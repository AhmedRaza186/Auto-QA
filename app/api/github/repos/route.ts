import axios from "axios"
import { currentUser } from "@clerk/nextjs/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function GET(){
    try {
        const clerkUser = await currentUser();
        const email = clerkUser?.primaryEmailAddress?.emailAddress;

        if (!email) {
            return NextResponse.json({error:'Github token not found'}, {status:400})
        }

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
        const token = user?.githubToken

        if(!token){
            return NextResponse.json({error:'Github token not found'}, {status:400})
        }
        const allRepos = []
        let page = 1
        while(true){
            const res = await axios.get(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,{
                headers:{
                    Authorization:`Bearer ${token}`,
                    Accept:'application/vnd.github+json'
                }
            })
            const repos = res.data
            if(!repos || !repos.length) break
            allRepos.push(...repos)
            page++
        }
        return NextResponse.json(allRepos.map((repo: any) => ({
            id:repo.id,
            name:repo.name,
            html_url:repo.html_url,
            full_name:repo.full_name,
            private_:repo.private,
            language:repo.language,
            description:repo.description,
            default_branch:repo.default_branch,
            owner:repo.owner?.login
        })))
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const response = NextResponse.json({error: "Failed to fetch repositories"}, { status });
        
        if (status === 401) {
            const clerkUser = await currentUser();
            const email = clerkUser?.primaryEmailAddress?.emailAddress;
            if (email) {
                const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
                if (user) {
                    await db.update(users).set({ githubToken: null }).where(eq(users.id, user.id));
                }
            }
        }
        
        return response;
    }
}