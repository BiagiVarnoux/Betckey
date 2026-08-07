import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

/** GET /api/stock?ids=1,2,3 → [{ id, stock }] — stock actual de los productos del carrito. */
export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get('ids') ?? '';
  const ids = param.split(',').map(Number).filter(n => Number.isInteger(n) && n > 0);
  if (!ids.length) return NextResponse.json([]);

  const rows = await getDb()
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(inArray(products.id, ids.slice(0, 100)));

  return NextResponse.json(rows);
}
