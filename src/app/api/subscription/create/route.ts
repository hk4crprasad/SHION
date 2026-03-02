import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getRazorpay } from '@/lib/razorpay';
import db from '@/lib/db';
import { subscriptions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if already subscribed
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  if (existing && existing.status === 'active') {
    return NextResponse.json(
      { error: 'Already subscribed' },
      { status: 409 },
    );
  }

  try {
    const razorpay = getRazorpay();

    const subscription = await (razorpay.subscriptions as any).create({
      plan_id: process.env.RAZORPAY_PLAN!,
      total_count: 12, // 12 billing cycles (monthly = 1 year auto-renew)
      customer_notify: 1,
      notify_info: {
        notify_phone: '',
        notify_email: user.email,
      },
    });

    // Upsert subscription record
    if (existing) {
      await db
        .update(subscriptions)
        .set({
          razorpaySubscriptionId: subscription.id,
          status: subscription.status,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, user.id));
    } else {
      await db.insert(subscriptions).values({
        userId: user.id,
        razorpaySubscriptionId: subscription.id,
        status: subscription.status,
      });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      userEmail: user.email,
      userName: user.name,
    });
  } catch (err: any) {
    console.error('Razorpay subscription create error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create subscription' },
      { status: 500 },
    );
  }
};
