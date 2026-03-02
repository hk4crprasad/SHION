import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import db from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ isPremium: false });
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.userId));

  const isPremium =
    !!sub &&
    sub.status === 'active' &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

  return NextResponse.json({
    isPremium,
    status: sub?.status ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
  });
};
