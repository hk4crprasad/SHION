import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
