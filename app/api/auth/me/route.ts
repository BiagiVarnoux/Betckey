import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyUserSessionToken, USER_SESSION_COOKIE } from '@/lib/user-auth';

export async function GET() {
  const jar = await cookies();
  const userId = await verifyUserSessionToken(jar.get(USER_SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json(null);

  const db = getDb();
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, lastName: users.lastName })
    .from(users).where(eq(users.id, userId)).limit(1);

  return NextResponse.json(user ?? null);
}
