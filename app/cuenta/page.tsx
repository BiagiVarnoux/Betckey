export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { users, orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyUserSessionToken, USER_SESSION_COOKIE } from '@/lib/user-auth';
import CuentaClient from './CuentaClient';

export default async function CuentaPage() {
  const jar = await cookies();
  const userId = await verifyUserSessionToken(jar.get(USER_SESSION_COOKIE)?.value);
  if (!userId) redirect('/cuenta/login');

  const db = getDb();
  const [user, userOrders] = await Promise.all([
    db.select({ id: users.id, email: users.email, name: users.name, lastName: users.lastName, address: users.address, city: users.city, phone: users.phone })
      .from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0]),
    db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)),
  ]);

  if (!user) redirect('/cuenta/login');

  return <CuentaClient user={user} orders={userOrders} />;
}
