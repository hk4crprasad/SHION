import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async (req: NextRequest) => {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY!)
    .update(body)
    .digest('hex');

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSig, 'hex'),
    )
  ) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = event?.payload?.subscription?.entity;
  if (!payload) {
    return NextResponse.json({ ok: true });
  }

  const razorpaySubscriptionId: string = payload.id;
  const status: string = payload.status;
  const currentPeriodEnd: number | undefined = payload.current_end;

  await db
    .update(subscriptions)
    .set({
      status: status as any,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : undefined,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.razorpaySubscriptionId, razorpaySubscriptionId));

  return NextResponse.json({ ok: true });
};
