import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return verifySessionToken(token);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const db = getDb();
  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const body = await req.json();
  const { code, discountType, discountValue, usageLimit, expiresAt } = body;

  if (!code?.trim() || !discountType || !discountValue) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const db = getDb();
  const [created] = await db.insert(coupons).values({
    code: code.trim().toUpperCase(),
    discountType,
    discountValue: String(discountValue),
    usageLimit: usageLimit ? Number(usageLimit) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
