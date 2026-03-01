import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { sendVerificationEmail } from '@/lib/auth/email';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .insert(verificationTokens)
      .values({ userId: user.id, token, expiresAt });

    await sendVerificationEmail(email, name, token);

    return NextResponse.json({
      message: 'Account created. Please check your email to verify.',
    });
  } catch (err) {
    console.error('[signup]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
