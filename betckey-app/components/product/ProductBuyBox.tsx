'use client';

import { useState } from 'react';
import { CheckCircle, Ruler, Hash, Printer, Scissors, Package } from 'lucide-react';
import type { Product } from '@/lib/db/schema';
import QuantitySelector from '@/components/ui/QuantitySelector';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { buildWhatsAppURL } from '@/lib/whatsapp';
import { formatBob } from '@/lib/utils';

export default function ProductBuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);

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

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <QuantitySelector value={qty} onChange={setQty} />
      </div>

      <WhatsAppButton href={waUrl} label="🟢 Pedir por WhatsApp" size="lg" className="w-full justify-center" />

      <p className="text-sm text-gray-500 text-center">
        Te respondemos a la brevedad para coordinar el envío
      </p>

      {/* Quick specs */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-1 gap-2">
        {[
          { icon: <Ruler size={15} />, label: 'Dimensiones', value: `${product.widthMm}mm × ${product.heightMm > 0 ? product.heightMm + 'mm' : 'continua'} (${product.widthIn} × ${product.heightIn})` },
          { icon: <Hash size={15} />, label: 'Cantidad', value: `${product.unitsPerRoll} etiquetas por rollo` },
          { icon: <Printer size={15} />, label: 'Tipo', value: product.labelType === 'die-cut' ? 'Troquelada (tamaño fijo)' : 'Continua (longitud variable)' },
          { icon: <Scissors size={15} />, label: 'Corte', value: product.labelType === 'die-cut' ? 'Pre-cortada' : 'Manual / automático' },
          { icon: <Package size={15} />, label: 'Material', value: 'Papel térmico recubierto' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-2 text-sm">
            <span className="text-gray-400 mt-0.5">{icon}</span>
            <span className="text-gray-500 min-w-[90px]">{label}:</span>
            <span className="text-gray-800 font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Trust row */}
      <div className="flex flex-wrap gap-3 pt-1">
        {['✅ 100% Compatible', '📦 Stock disponible', '🚚 Envío Bolivia'].map((b) => (
          <span key={b} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{b}</span>
        ))}
      </div>
    </div>
  );
}
