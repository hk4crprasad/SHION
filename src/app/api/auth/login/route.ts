import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signToken } from '@/lib/auth/jwt';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    // Use constant-time comparison to avoid timing attacks
    const validPassword =
      user ? await compare(password, user.passwordHash) : false;

    if (!user || !validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before signing in' },
        { status: 403 },
      );
    }

    const token = await signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      message: 'Signed in successfully',
      user: { name: user.name, email: user.email },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
