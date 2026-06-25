import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyUserSessionToken, USER_SESSION_COOKIE } from '@/lib/user-auth';

async function requireUser() {
  const jar = await cookies();
  return verifyUserSessionToken(jar.get(USER_SESSION_COOKIE)?.value);
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const db = getDb();
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, lastName: users.lastName, address: users.address, city: users.city, phone: users.phone })
    .from(users).where(eq(users.id, userId)).limit(1);

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { name, lastName, address, city, phone } = await req.json();
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({ name: name ?? '', lastName: lastName ?? '', address: address ?? '', city: city ?? '', phone: phone ?? '', updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id, email: users.email, name: users.name, lastName: users.lastName, address: users.address, city: users.city, phone: users.phone });

  return NextResponse.json(updated);
}
