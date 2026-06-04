'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductWithImages } from '@/lib/products';
import { Save, CheckCircle } from 'lucide-react';
import ImageManager from '@/components/admin/ImageManager';

export default function EditProductForm({ product }: { product: ProductWithImages }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product.name,
    priceUsd: product.priceUsd ?? '',
    priceBob: product.priceBob ?? '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/productos/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        priceUsd: form.priceUsd !== '' ? form.priceUsd : null,
        priceBob: form.priceBob !== '' ? form.priceBob : null,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder),
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } else {
      setError('Error al guardar. Intentá de nuevo.');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
      {/* Precio BOB */}
      <div className="bg-orange-50 border-2 border-[var(--color-accent)] rounded-xl p-5">
        <label className="block text-sm font-bold text-gray-900 mb-1">
          💰 Precio en BOB <span className="text-[var(--color-accent)]">(campo principal)</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-500">Bs.</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.priceBob}
            onChange={(e) => setForm({ ...form, priceBob: e.target.value })}
            className="flex-1 border border-orange-300 rounded-lg px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Dejá en blanco para mostrar "Consultar precio" en la tienda.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio referencia USD</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.priceUsd}
            onChange={(e) => setForm({ ...form, priceUsd: e.target.value })}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Orden de visualización</label>
        <input
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className="w-32 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm font-medium text-gray-700">Producto activo (visible en la tienda)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="w-4 h-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm font-medium text-gray-700">Destacado en homepage</span>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saved ? (
          <>
            <CheckCircle size={18} />
            ¡Guardado!
          </>
        ) : (
          <>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </>
        )}
      </button>

      {/* Imágenes — fuera del submit, manejo independiente */}
      <ImageManager productId={product.id} initialImages={product.images} />
    </form>
  );
}
