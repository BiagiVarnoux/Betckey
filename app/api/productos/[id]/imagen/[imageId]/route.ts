import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const c = await cookies();
  return c.get('admin_session')?.value === process.env.ADMIN_PASSWORD;
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id, imageId } = await params;
  const [img] = await db.select().from(productImages).where(eq(productImages.id, Number(imageId))).limit(1);
  if (!img) return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });

  // Eliminar archivo físico
  const filePath = path.join(process.cwd(), 'public', img.url.replace(/^\//, ''));
  if (existsSync(filePath)) await unlink(filePath).catch(() => {});

  await db.delete(productImages).where(eq(productImages.id, Number(imageId)));

  // Actualizar cover del producto con la primera imagen restante
  const remaining = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, Number(id)))
    .orderBy(asc(productImages.sortOrder))
    .limit(1);

  await db.update(products)
    .set({ imageUrl: remaining[0]?.url ?? null, updatedAt: new Date() })
    .where(eq(products.id, Number(id)));

  return NextResponse.json({ ok: true });
}
