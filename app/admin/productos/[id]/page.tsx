export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/lib/products';
import { getDb } from '@/lib/db';
import { printers, productPrinters } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import EditProductForm from './EditProductForm';
import { ArrowLeft } from 'lucide-react';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  const db = getDb();
  const [allPrinters, links] = await Promise.all([
    db.select().from(printers).orderBy(asc(printers.brand), asc(printers.sortOrder), asc(printers.model)),
    db.select().from(productPrinters).where(eq(productPrinters.productId, product.id)),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
          <p className="text-sm text-gray-500">{product.model} — {product.name}</p>
        </div>
      </div>

      <EditProductForm
        product={product}
        printers={allPrinters}
        initialPrinterIds={links.map((l) => l.printerId)}
      />
    </div>
  );
}
