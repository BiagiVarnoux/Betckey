'use client';

import { useState } from 'react';
import { CheckCircle, PackageCheck, PackageMinus, PackageX, AlertTriangle } from 'lucide-react';
import type { Product } from '@/lib/db/schema';
import QuantitySelector from '@/components/ui/QuantitySelector';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { buildWhatsAppURL } from '@/lib/whatsapp';
import { formatBob } from '@/lib/utils';

function StockBadge({ stock }: { stock: number | null | string }) {
  const n = stock === null || stock === '' ? null : Number(stock);
  if (n === null) return null;
  if (n === 0)  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
      <PackageX size={15} /> Sin stock
    </span>
  );
  if (n <= 3)   return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
      <AlertTriangle size={15} /> ¡Últimas {n} {n === 1 ? 'unidad' : 'unidades'}!
    </span>
  );
  if (n <= 10)  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
      <PackageMinus size={15} /> Quedan {n} unidades
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
      <PackageCheck size={15} /> En stock
    </span>
  );
}

export default function ProductBuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const outOfStock = Number(product.stock) === 0 && product.stock !== null;

  const waUrl = buildWhatsAppURL({ product: product.name, model: product.model, quantity: qty });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full border border-green-200">
          <CheckCircle size={14} /> Compatible con Brother QL
        </span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

      <div>
        {product.priceBob ? (
          <>
            <p className="text-4xl font-bold text-[var(--color-accent)]">{formatBob(product.priceBob)}</p>
            <p className="text-sm text-gray-500 mt-1">por rollo · {product.unitsPerRoll} etiquetas incluidas</p>
          </>
        ) : (
          <p className="text-2xl font-semibold text-gray-500">Consultar precio</p>
        )}
      </div>

      <StockBadge stock={product.stock} />

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <QuantitySelector value={qty} onChange={setQty} />
      </div>

      {outOfStock ? (
        <button disabled className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
          Sin stock disponible
        </button>
      ) : (
        <WhatsAppButton href={waUrl} label="🟢 Pedir por WhatsApp" size="lg" className="w-full justify-center" />
      )}

      <p className="text-sm text-gray-500 text-center">
        Te respondemos a la brevedad para coordinar el envío
      </p>

      {/* Quick specs — primeras 5 del array libre */}
      {(() => {
        const specs = (product.specs as { label: string; value: string }[] | null) ?? [];
        if (specs.length === 0) return null;
        return (
          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 gap-2">
            {specs.slice(0, 5).map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[140px_1fr] gap-2 text-sm">
                <span className="text-gray-500 shrink-0">{label}:</span>
                <span className="text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Trust row */}
      <div className="flex flex-wrap gap-3 pt-1">
        {['🚚 Envíos a todo Bolivia', '💬 Atención WhatsApp'].map((b) => (
          <span key={b} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{b}</span>
        ))}
      </div>
    </div>
  );
}
