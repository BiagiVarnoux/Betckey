import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';

async function requireAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id, imageId } = await params;
  const [img] = await db.select().from(productImages).where(eq(productImages.id, Number(imageId))).limit(1);
  if (!img) return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });

  // Eliminar del Blob store
  await del(img.url).catch(() => {});

  await db.delete(productImages).where(eq(productImages.id, Number(imageId)));

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
