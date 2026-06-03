export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/lib/products';
import EditProductForm from './EditProductForm';
import { ArrowLeft } from 'lucide-react';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
          <p className="text-sm text-gray-500">{product.model} — {product.name}</p>
        </div>
      </div>

      {/* Non-editable info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
        <p><strong>Slug:</strong> {product.slug}</p>
        <p><strong>Dimensiones:</strong> {product.widthMm}mm × {product.heightMm > 0 ? product.heightMm + 'mm' : 'continua'}</p>
        <p><strong>Compatibilidad:</strong> {product.compatibleWith.join(', ')}</p>
        <p className="mt-1 text-xs text-gray-400">Estos campos no se editan desde el panel para proteger la integridad de datos.</p>
      </div>

      <EditProductForm product={product} />
    </div>
  );
}
