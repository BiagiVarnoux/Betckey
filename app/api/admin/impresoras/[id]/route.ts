import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { printers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';

async function requireAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get('admin_session')?.value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const update: Record<string, unknown> = {};
  for (const key of ['brand', 'model', 'isActive', 'sortOrder'] as const) {
    if (key in body) update[key] = body[key];
  }

  try {
    const [row] = await getDb().update(printers).set(update).where(eq(printers.id, Number(id))).returning();
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: 'Esa impresora ya existe en la marca elegida.' }, { status: 409 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  // Las filas de product_printers caen solas por ON DELETE CASCADE
  await getDb().delete(printers).where(eq(printers.id, Number(id)));
  return NextResponse.json({ ok: true });
}
