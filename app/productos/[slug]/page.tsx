import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, getAllProducts } from '@/lib/products';
import ProductGallery from '@/components/product/ProductGallery';
import ProductBuyBox from '@/components/product/ProductBuyBox';
import CompatiblePrinters from '@/components/product/CompatiblePrinters';
import SpecsTable from '@/components/product/SpecsTable';
import FAQAccordion from '@/components/product/FAQAccordion';
import StickyBuyBar from '@/components/product/StickyBuyBar';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  const autoDesc = `Comprar ${product.model} en Bolivia. ${product.mainUse}. ${product.unitsPerRoll} etiquetas por rollo. Envío a todo Bolivia.`;
  const metaDesc = product.metaDescription ?? autoDesc;

  return {
    title: `${product.name} | ${brand}`,
    description: metaDesc,
    openGraph: {
      title: product.name,
      description: metaDesc,
      type: 'website',
      locale: 'es_BO',
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.mainUse,
    brand: { '@type': 'Brand', name: 'BETCKEY' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BOB',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: brand },
      ...(product.priceBob ? { price: product.priceBob } : {}),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <Link href="/catalogo" className="hover:text-[var(--color-primary)] transition-colors">Catálogo</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{product.model}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <ProductGallery product={product} />
          <ProductBuyBox product={product} />
        </div>

        {/* Características dinámicas del producto */}
        {product.features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {product.features.map((f) => (
              <div key={f} className="bg-[var(--color-surface)] rounded-xl px-5 py-4 flex items-start gap-3">
                <span className="text-[var(--color-primary)] font-bold text-lg leading-none mt-0.5">✓</span>
                <p className="text-sm text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        )}

        {/* Descripción larga */}
        {product.description && (
          <div className="py-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        <CompatiblePrinters compatibleWith={product.compatibleWith} model={product.model} />
        <SpecsTable product={product} />
        <FAQAccordion />
      </div>

      <StickyBuyBar product={product} />
    </>
  );
}
