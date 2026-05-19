import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const user = await currentUser()
    try {
        const userResult = await db.select().from(users).where(eq(users.email, user?.primaryEmailAddress?.emailAddress ?? ""))
        if(userResult.length == 0){
            const newUser =  await db.insert(users).values({
                name:user?.fullName??'New User',
                email:user?.primaryEmailAddress?.emailAddress?? ''

            }).returning()
            return NextResponse.json({user:newUser[0]})

        }
        return NextResponse.json({user:userResult[0]})
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({error:'Something went wrong',status:500})

    }
}