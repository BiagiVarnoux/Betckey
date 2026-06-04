import { db } from './db';
import { products, productImages } from './db/schema';
import { eq, asc } from 'drizzle-orm';
import type { Product, ProductImage } from './db/schema';

export type ProductWithImages = Product & { images: ProductImage[] };

async function attachImages(rows: Product[]): Promise<ProductWithImages[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);
  const allImages = await db
    .select()
    .from(productImages)
    .orderBy(asc(productImages.sortOrder));
  const byProduct: Record<number, ProductImage[]> = {};
  for (const img of allImages) {
    if (ids.includes(img.productId)) {
      (byProduct[img.productId] ??= []).push(img);
    }
  }
  return rows.map((p) => ({ ...p, images: byProduct[p.id] ?? [] }));
}

export async function getAllProducts(): Promise<ProductWithImages[]> {
  const rows = await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.sortOrder));
  return attachImages(rows);
}

export async function getFeaturedProducts(): Promise<ProductWithImages[]> {
  const rows = await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.sortOrder));
  return attachImages(rows);
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!result[0]) return null;
  const [withImages] = await attachImages(result);
  return withImages;
}

export async function getProductById(id: number): Promise<ProductWithImages | null> {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!result[0]) return null;
  const [withImages] = await attachImages(result);
  return withImages;
}

export async function getAllProductsAdmin(): Promise<ProductWithImages[]> {
  const rows = await db.select().from(products).orderBy(asc(products.sortOrder));
  return attachImages(rows);
}

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder));
}
