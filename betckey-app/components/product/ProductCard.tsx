import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/db/schema';
import { buildWhatsAppURL } from '@/lib/whatsapp';
import { formatBob } from '@/lib/utils';
import ProductPlaceholder from './ProductPlaceholder';

interface Props {
  product: Product;
  showBadge?: boolean;
}

export default function ProductCard({ product, showBadge = false }: Props) {
  const waUrl = buildWhatsAppURL({ product: product.name, model: product.model, quantity: 1 });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative">
        {showBadge && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--color-accent)] text-white text-xs font-bold px-2 py-1 rounded-full">
            Más vendido
          </span>
        )}
        <Link href={`/productos/${product.slug}`}>
          <ProductPlaceholder
            model={product.model}
            widthMm={product.widthMm}
            heightMm={product.heightMm}
            labelType={product.labelType}
            className="m-4"
          />
        </Link>
      </div>

      <div className="px-4 pb-4 flex flex-col flex-1 gap-3">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wide">Modelo: {product.model}</p>
          <Link href={`/productos/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 hover:text-[var(--color-primary)] transition-colors line-clamp-2 mt-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {product.widthMm}mm × {product.heightMm > 0 ? `${product.heightMm}mm` : 'continua'} · {product.unitsPerRoll} etiquetas
          </p>
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-bold text-[var(--color-accent)]">
            {product.priceBob ? `${formatBob(product.priceBob)}` : 'Consultar precio'}
          </p>
          <p className="text-xs text-gray-400">por rollo</p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[var(--color-whatsapp)] text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            <MessageCircle size={16} />
            Pedir por WhatsApp
          </a>
          <Link
            href={`/productos/${product.slug}`}
            className="flex items-center justify-center gap-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-sm"
          >
            Ver detalles <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
