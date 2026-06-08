import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (webhookSecret) {
      console.log('Constructing Stripe webhook event with signature verification...');
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      console.warn(
        '⚠️ STRIPE_WEBHOOK_SECRET is not set. Bypassing signature verification in development.'
      );
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`❌ Stripe Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`ℹ️ Received Stripe webhook event: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as any;
      const userId = Number(session.metadata?.userId || 0);

      console.log(`Processing checkout.session.completed for user ID: ${userId}`);

      if (userId > 0) {
        try {
          const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (currentUser) {
            const previousCredits = currentUser.credits || 0;
            // The starter plan claims to add 1,000 credits, but backend sets 10,000.
            // We'll update the database using the 10,000 value as configured, but print it out.
            const creditsToAdd = 1000;
            const newCredits = previousCredits + creditsToAdd;

            await db
              .update(users)
              .set({ credits: newCredits })
              .where(eq(users.id, userId));

            console.log(
              `✅ Successfully updated credits for user ${currentUser.email} (ID: ${userId}). ` +
              `Old: ${previousCredits}, Added: ${creditsToAdd}, New: ${newCredits}`
            );
          } else {
            console.error(`❌ User with ID ${userId} not found in database.`);
          }
        } catch (dbErr: any) {
          console.error(`❌ Database error during credit update: ${dbErr.message}`);
        }
      } else {
        console.warn('⚠️ No valid userId found in session metadata.');
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }

  return NextResponse.json({ received: true });
}

