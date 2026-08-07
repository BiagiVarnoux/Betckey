import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';
import { getDb } from '@/lib/db';
import { pickupPoints } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

async function requireAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function GET() {
  const db = getDb();
  const rows = await db.select().from(pickupPoints).orderBy(asc(pickupPoints.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { name, address, city, schedule, sortOrder } = await req.json();
  if (!name?.trim() || !address?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'Nombre, dirección y ciudad son requeridos.' }, { status: 400 });
  }
  const db = getDb();
  const [row] = await db.insert(pickupPoints).values({
    name: name.trim(), address: address.trim(), city: city.trim(),
    schedule: schedule?.trim() ?? '', sortOrder: sortOrder ?? 0,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
