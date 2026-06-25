import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyUserSessionToken, USER_SESSION_COOKIE } from '@/lib/user-auth';

export async function GET() {
  const jar = await cookies();
  const userId = await verifyUserSessionToken(jar.get(USER_SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(userOrders);
}
