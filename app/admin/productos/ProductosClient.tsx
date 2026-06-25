'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Trash2, Eye, EyeOff, ImageIcon, AlertTriangle } from 'lucide-react';
import { formatBob } from '@/lib/utils';

type ProductRow = {
  id: number;
  model: string;
  name: string;
  priceBob: string | null;
  isActive: boolean;
  imageUrl: string | null;
};

export default function ProductosClient({ initial }: { initial: ProductRow[] }) {
  const [products, setProducts] = useState<ProductRow[]>(initial);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function toggleActive(p: ProductRow) {
    setLoadingId(p.id);
    const res = await fetch(`/api/productos/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !p.isActive } : x));
    }
    setLoadingId(null);
  }

  async function deleteProduct(p: ProductRow) {
    if (!confirm(`¿Eliminar "${p.model} – ${p.name}"? Esta acción no se puede deshacer.`)) return;
    setLoadingId(p.id);
    const res = await fetch(`/api/productos/${p.id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    }
    setLoadingId(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 w-12" />
            <th className="text-left px-6 py-4 font-semibold text-gray-700">Modelo</th>
            <th className="text-left px-6 py-4 font-semibold text-gray-700 hidden md:table-cell">Nombre</th>
            <th className="text-left px-6 py-4 font-semibold text-gray-700">Precio BOB</th>
            <th className="text-left px-6 py-4 font-semibold text-gray-700">Estado</th>
            <th className="text-right px-6 py-4 font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                No hay productos. Creá el primero con el botón de arriba.
              </td>
            </tr>
          )}
          {products.map((p) => (
            <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${loadingId === p.id ? 'opacity-50' : ''}`}>
              <td className="pl-6 py-3">
                <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.model} width={40} height={40} className="object-contain w-full h-full" />
                  ) : (
                    <ImageIcon size={16} className="text-gray-300" />
                  )}
                </div>
              </td>
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
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => toggleActive(p)}
                    disabled={loadingId === p.id}
                    title={p.isActive ? 'Desactivar' : 'Activar'}
                    className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                  >
                    {p.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteProduct(p)}
                    disabled={loadingId === p.id}
                    title="Eliminar producto"
                    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
