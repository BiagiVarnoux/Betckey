import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { decreaseStock, restoreStock } from '@/lib/stock';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return verifySessionToken(token);
}

const VALID_STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  // Ajustar el stock según el cambio de estado
  let stockApplied = order.stockApplied;
  if (status === 'cancelled' && order.stockApplied) {
    // Se cancela: las unidades vuelven al stock
    await restoreStock(order.items);
    stockApplied = false;
  } else if (status !== 'cancelled' && !order.stockApplied) {
    // Se reactiva un pedido cancelado: se vuelven a descontar
    await decreaseStock(order.items);
    stockApplied = true;
  }

  await db.update(orders)
    .set({ status, stockApplied, updatedAt: new Date() })
    .where(eq(orders.id, Number(id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  // Si el pedido tenía stock descontado, devolverlo antes de eliminar
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (order?.stockApplied) {
    await restoreStock(order.items);
  }

  await db.delete(orders).where(eq(orders.id, Number(id)));

  return NextResponse.json({ ok: true });
}
