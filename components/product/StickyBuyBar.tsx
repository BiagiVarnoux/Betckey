'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/db/schema';
import { formatBob } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import ProductPlaceholder from './ProductPlaceholder';

export default function StickyBuyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY - window.innerHeight : Infinity;
      setVisible(scrollY > 300 && scrollY < footerTop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const outOfStock = product.stock !== null && Number(product.stock) === 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
          <ProductPlaceholder
            model={product.model}
            widthMm={product.widthMm}
            heightMm={product.heightMm}
            labelType={product.labelType}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{product.model}</p>
          <p className="text-[var(--color-accent)] font-bold text-sm">
            {product.priceBob ? formatBob(product.priceBob) : 'Consultar precio'}
          </p>
        </div>
        <button
          onClick={() => addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            model: product.model,
            priceBob: product.priceBob ?? null,
            imageUrl: product.imageUrl ?? null,
            stock: product.stock ?? null,
          })}
          disabled={outOfStock}
          className="flex-shrink-0 flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          {outOfStock ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}
