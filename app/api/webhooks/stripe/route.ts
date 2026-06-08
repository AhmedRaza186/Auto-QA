import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as any;
      const userId = Number(session.metadata?.userId || 0);

      if (userId > 0) {
        const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (currentUser) {
          await db
            .update(users)
            .set({ credits: (currentUser.credits || 0) + 10000 })
            .where(eq(users.id, userId));
        }
      }
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
