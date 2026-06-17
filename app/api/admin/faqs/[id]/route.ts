import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function isAuthenticated() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const [updated] = await db.update(faqs).set(body).where(eq(faqs.id, Number(id))).returning();
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  await db.delete(faqs).where(eq(faqs.id, Number(id)));
  return NextResponse.json({ ok: true });
}
