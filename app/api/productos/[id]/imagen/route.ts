import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { products, productImages } from '@/lib/db/schema';
import { eq, asc, max } from 'drizzle-orm';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const c = await cookies();
  return c.get('admin_session')?.value === process.env.ADMIN_PASSWORD;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, Number(id)))
    .orderBy(asc(productImages.sortOrder));
  return NextResponse.json(images);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // Calcular siguiente sortOrder
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(productImages.sortOrder) })
    .from(productImages)
    .where(eq(productImages.productId, Number(id)));
  const nextOrder = (maxOrder ?? -1) + 1;

  const dir = path.join(process.cwd(), 'public', 'products', product.slug);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const filename = `${product.slug}-${nextOrder}.${ext}`;
  const filePath = path.join(dir, filename);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const url = `/products/${product.slug}/${filename}`;
  const alt = `${product.name} — imagen ${nextOrder + 1}`;

  const [created] = await db.insert(productImages).values({
    productId: Number(id),
    url,
    alt,
    sortOrder: nextOrder,
  }).returning();

  // Si es la primera imagen, actualizar cover del producto
  if (nextOrder === 0) {
    await db.update(products).set({ imageUrl: url, updatedAt: new Date() }).where(eq(products.id, Number(id)));
  }

  return NextResponse.json(created);
}

// Reordenar: recibe [{ id, sortOrder }]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // Actualizar cover con la imagen de sortOrder 0
  const first = body.find((x) => x.sortOrder === 0);
  if (first) {
    const [img] = await db.select().from(productImages).where(eq(productImages.id, first.id)).limit(1);
    if (img) {
      await db.update(products).set({ imageUrl: img.url, updatedAt: new Date() }).where(eq(products.id, Number(id)));
    }
  }

  return NextResponse.json({ ok: true });
}
