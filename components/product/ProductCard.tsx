import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { ProductWithImages } from '@/lib/products';
import { formatBob } from '@/lib/utils';
import ProductPlaceholder from './ProductPlaceholder';

// Cover legacy para DK-2205 cuando no hay imágenes en DB
const LEGACY_COVER: Record<string, { src: string; alt: string }> = {
  'dk-2205': {
    src: '/products/dk-2205/etiquetas-brother-dk-2205-uso-envio-cajas.webp',
    alt: 'Etiquetas Brother DK-2205 usadas en cajas de envío',
  },
};

interface Props {
  product: ProductWithImages;
  showBadge?: boolean;
}

export default function ProductCard({ product, showBadge = false }: Props) {
  // DB tiene prioridad, luego legacy, luego placeholder
  const dbCover = product.images[0] ? { src: product.images[0].url, alt: product.images[0].alt } : null;
  const cover = dbCover ?? LEGACY_COVER[product.slug] ?? null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative h-52">
        {showBadge && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--color-accent)] text-white text-xs font-bold px-2 py-1 rounded-full">
            Más vendido
          </span>
        )}
        <Link href={`/productos/${product.slug}`} className="block w-full h-full">
          {cover ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <ProductPlaceholder
                model={product.model}
                widthMm={product.widthMm}
                heightMm={product.heightMm}
                labelType={product.labelType}
                className="max-h-full"
              />
            </div>
          )}
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
          <Link
            href={`/productos/${product.slug}`}
            className="flex items-center justify-center gap-1 bg-[var(--color-primary)] text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Ver detalles <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
