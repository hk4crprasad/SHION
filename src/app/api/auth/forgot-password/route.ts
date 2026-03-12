import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { sendPasswordResetEmail } from '@/lib/auth/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a reset link has been sent.',
      });
    }

    // Invalidate any existing reset tokens for this user
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .insert(passwordResetTokens)
      .values({ userId: user.id, token, expiresAt });

    await sendPasswordResetEmail(user.email, user.name, token);

    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
