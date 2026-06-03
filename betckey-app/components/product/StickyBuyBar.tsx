'use client';

import { useState, useEffect, useRef } from 'react';
import type { Product } from '@/lib/db/schema';
import { buildWhatsAppURL } from '@/lib/whatsapp';
import { formatBob } from '@/lib/utils';
import ProductPlaceholder from './ProductPlaceholder';

export default function StickyBuyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

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

  const waUrl = buildWhatsAppURL({ product: product.name, model: product.model, quantity: 1 });

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
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-[var(--color-whatsapp)] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          💬 Pedir
        </a>
      </div>
    </div>
  );
}
