import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';
import { getDb } from '@/lib/db';
import { pickupPoints } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function requireAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed = ['name', 'address', 'city', 'schedule', 'isActive', 'sortOrder'] as const;
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  const db = getDb();
  const [row] = await db.update(pickupPoints).set(update).where(eq(pickupPoints.id, Number(id))).returning();
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  await db.delete(pickupPoints).where(eq(pickupPoints.id, Number(id)));
  return NextResponse.json({ ok: true });
}
