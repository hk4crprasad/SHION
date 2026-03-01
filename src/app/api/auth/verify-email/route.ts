import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt } from 'drizzle-orm';
import db from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const base = new URL(req.url);
  const origin = `${base.protocol}//${base.host}`;

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing-token`);
  }

  try {
    const [vt] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          gt(verificationTokens.expiresAt, new Date()),
        ),
      );

    if (!vt) {
      return NextResponse.redirect(`${origin}/login?error=invalid-token`);
    }

    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, vt.userId));

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, vt.id));

    return NextResponse.redirect(`${origin}/login?verified=true`);
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.redirect(`${origin}/login?error=server-error`);
  }
}
