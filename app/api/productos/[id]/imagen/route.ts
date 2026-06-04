import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/db/schema';
import { eq, asc, max } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';

async function requireAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, Number(id)))
      .orderBy(asc(productImages.sortOrder));
    return NextResponse.json(images);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const [product] = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get('imagen') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo no permitido. Usá JPG, PNG o WebP.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'El archivo supera el límite de 5 MB.' }, { status: 400 });
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';

    // max() en Neon devuelve string — convertir explícitamente a número
    const [row] = await db
      .select({ maxOrder: max(productImages.sortOrder) })
      .from(productImages)
      .where(eq(productImages.productId, Number(id)));
    const nextOrder = row?.maxOrder != null ? Number(row.maxOrder) + 1 : 0;

    const filename = `products/${product.slug}/${product.slug}-${nextOrder}.${ext}`;
    const { url } = await put(filename, file, { access: 'public' });

    const alt = `${product.name} — imagen ${nextOrder + 1}`;
    const [created] = await db.insert(productImages).values({
      productId: Number(id),
      url,
      alt,
      sortOrder: nextOrder,
    }).returning();

    // Actualizar cover si es la primera imagen
    if (nextOrder === 0) {
      await db.update(products).set({ imageUrl: url, updatedAt: new Date() }).where(eq(products.id, Number(id)));
    }

    return NextResponse.json(created);
  } catch (err) {
    console.error('[imagen POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body: { id: number; sortOrder: number }[] = await request.json();

    await Promise.all(
      body.map(({ id: imgId, sortOrder }) =>
        db.update(productImages).set({ sortOrder }).where(eq(productImages.id, imgId))
      )
    );

    const first = body.find((x) => x.sortOrder === 0);
    if (first) {
      const [img] = await db.select().from(productImages).where(eq(productImages.id, first.id)).limit(1);
      if (img) {
        await db.update(products).set({ imageUrl: img.url, updatedAt: new Date() }).where(eq(products.id, Number(id)));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[imagen PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
