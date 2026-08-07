import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import type { OrderItem } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Descuenta (sign = -1) o devuelve (sign = +1) las unidades de un pedido.
 * Los productos con stock = null no llevan control de stock y se ignoran.
 * El stock nunca baja de 0.
 */
async function moveStock(items: OrderItem[], sign: -1 | 1): Promise<void> {
  const db = getDb();

  // Agrupar por producto por si el mismo producto viene repetido
  const byProduct = new Map<number, number>();
  for (const item of items) {
    if (!item.productId || !item.quantity) continue;
    byProduct.set(item.productId, (byProduct.get(item.productId) ?? 0) + item.quantity);
  }

  for (const [productId, quantity] of byProduct) {
    const delta = sign * quantity;
    await db
      .update(products)
      .set({
        stock: sql`GREATEST(0, ${products.stock} + ${delta})`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));
  }
}

/** Resta del stock las unidades de un pedido. */
export const decreaseStock = (items: OrderItem[]) => moveStock(items, -1);

/** Devuelve al stock las unidades de un pedido cancelado o eliminado. */
export const restoreStock = (items: OrderItem[]) => moveStock(items, 1);
