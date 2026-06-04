'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductWithImages } from '@/lib/products';
import ProductPlaceholder from './ProductPlaceholder';

// Imágenes legacy hardcodeadas para DK-2205 mientras no tenga imágenes en DB
const LEGACY_IMAGES: Record<string, { src: string; alt: string }[]> = {
  'dk-2205': [
    { src: '/products/dk-2205/etiquetas-brother-dk-2205-uso-envio-cajas.webp',              alt: 'Etiquetas Brother DK-2205 usadas en cajas de envío' },
    { src: '/products/dk-2205/etiquetas-dk-2205-instrucciones-instalacion-rollo.webp',       alt: 'Instrucciones de instalación del rollo DK-2205' },
    { src: '/products/dk-2205/etiquetas-dk-2205-impresoras-brother-ql-compatibles.webp',     alt: 'Impresoras Brother QL compatibles con DK-2205' },
    { src: '/products/dk-2205/etiquetas-continuas-dk-2205-caracteristicas-62mm-100pies.webp',alt: 'Características etiqueta continua DK-2205 62mm' },
    { src: '/products/dk-2205/rollo-etiqueta-brother-dk-2205-continua-62mm-betckey.webp',    alt: 'Rollo etiqueta continua Brother DK-2205 BETCKEY' },
  ],
};

export default function ProductGallery({ product }: { product: ProductWithImages }) {
  // Las imágenes de DB tienen prioridad. Si no hay, usar legacy.
  const dbImages = product.images.map((img) => ({ src: img.url, alt: img.alt }));
  const images = dbImages.length > 0 ? dbImages : (LEGACY_IMAGES[product.slug] ?? []);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white relative aspect-square">
        <Image
          src={images[active].src}
          alt={images[active].alt}
          fill
          className="object-contain p-4"
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setActive(i)}
              className={`relative flex-1 aspect-square rounded-xl border-2 overflow-hidden transition-colors bg-white ${
                active === i ? 'border-[var(--color-primary)]' : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image src={img.src} alt={img.alt} fill className="object-contain p-1" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
