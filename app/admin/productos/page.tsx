export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllProductsAdmin } from '@/lib/products';
import { ArrowLeft, Plus } from 'lucide-react';
import ProductosClient from './ProductosClient';

export default async function AdminProductosPage() {
  const products = await getAllProductsAdmin();

  const rows = products.map((p) => ({
    id: p.id,
    model: p.model,
    name: p.name,
    priceBob: p.priceBob,
    isActive: p.isActive,
    imageUrl: p.imageUrl ?? null,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      <ProductosClient initial={rows} />
    </div>
  );
}
