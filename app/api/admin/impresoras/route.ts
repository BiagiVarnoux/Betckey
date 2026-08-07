import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { printers } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';

async function requireAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get('admin_session')?.value);
}

export async function GET() {
  const rows = await getDb().select().from(printers)
    .orderBy(asc(printers.brand), asc(printers.sortOrder), asc(printers.model));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { brand, model, sortOrder } = await request.json();
  if (!brand?.trim() || !model?.trim()) {
    return NextResponse.json({ error: 'Marca y modelo son obligatorios' }, { status: 400 });
  }

  try {
    const [created] = await getDb().insert(printers)
      .values({ brand: brand.trim(), model: model.trim(), sortOrder: Number(sortOrder) || 0 })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Esa impresora ya existe en la marca elegida.' }, { status: 409 });
  }
}
