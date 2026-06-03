export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllProductsAdmin } from '@/lib/products';
import { formatBob } from '@/lib/utils';
import { ArrowLeft, Pencil, AlertTriangle } from 'lucide-react';

export default async function AdminProductosPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Modelo</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700 hidden md:table-cell">Nombre</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Precio BOB</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Estado</th>
              <th className="text-right px-6 py-4 font-semibold text-gray-700">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-[var(--color-primary)]">{p.model}</td>
                <td className="px-6 py-4 text-gray-700 hidden md:table-cell max-w-xs truncate">{p.name}</td>
                <td className="px-6 py-4">
                  {p.priceBob ? (
                    <span className="font-semibold text-gray-900">{formatBob(p.priceBob)}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <AlertTriangle size={14} />
                      Sin precio
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
