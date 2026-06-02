import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;

    if (!clerkUser || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Try to fetch existing user by unique email
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ user: existing[0] });
    }

    // 2) Attempt to insert; if a race happens, do nothing then re-select
    const inserted = await db
      .insert(users)
      .values({
        name: clerkUser.fullName ?? "New User",
        email,
      })
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (inserted.length > 0) {
      return NextResponse.json({ user: inserted[0] });
    }

    const after = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (after.length > 0) {
      return NextResponse.json({ user: after[0] });
    }

    return NextResponse.json({ error: "Failed to create or fetch user" }, { status: 500 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}