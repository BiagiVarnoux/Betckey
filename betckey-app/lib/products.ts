import { db } from './db';
import { products } from './db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getAllProducts() {
  return db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.sortOrder));
}

export async function getFeaturedProducts() {
  return db.select().from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.sortOrder));
}

export async function getProductBySlug(slug: string) {
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getProductById(id: number) {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllProductsAdmin() {
  return db.select().from(products).orderBy(asc(products.sortOrder));
}
