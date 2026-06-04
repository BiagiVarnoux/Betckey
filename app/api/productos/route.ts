import { NextResponse } from 'next/server';
import { getAllProductsAdmin } from '@/lib/products';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';

async function requireAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function GET() {
  const all = await getAllProductsAdmin();
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const [created] = await db.insert(products).values(body).returning();
  return NextResponse.json(created, { status: 201 });
}
