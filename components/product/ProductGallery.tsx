'use client';

import { useState } from 'react';
import type { Product } from '@/lib/db/schema';
import ProductPlaceholder from './ProductPlaceholder';

const thumbVariants = ['producto', 'características', 'rollo'] as const;

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white p-4">
        <ProductPlaceholder
          model={product.model}
          widthMm={product.widthMm}
          heightMm={product.heightMm}
          labelType={product.labelType}
          className="w-full"
        />
      </div>
      <div className="flex gap-3">
        {thumbVariants.map((v, i) => (
          <button
            key={v}
            onClick={() => setActive(i)}
            className={`flex-1 rounded-xl border-2 overflow-hidden transition-colors ${
              active === i ? 'border-[var(--color-primary)]' : 'border-gray-200'
            }`}
          >
            <ProductPlaceholder
              model={product.model}
              widthMm={product.widthMm}
              heightMm={product.heightMm}
              labelType={product.labelType}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
