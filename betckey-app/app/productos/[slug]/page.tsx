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
import { ChevronRight, Zap, Shield, Package2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  return {
    title: `${product.name} | ${brand}`,
    description: `Comprar ${product.model} en Bolivia. ${product.mainUse}. ${product.unitsPerRoll} etiquetas por rollo. Envío a todo Bolivia.`,
    openGraph: {
      title: product.name,
      description: `${product.model}: ${product.mainUse}. ${product.unitsPerRoll} etiquetas/rollo. Compatible con Brother QL.`,
      type: 'website',
      locale: 'es_BO',
    },
  };
}

const featureBlocks = [
  { icon: <Zap size={24} />, title: 'Impresión nítida', desc: 'Tecnología térmica directa para texto y códigos de barra perfectos.' },
  { icon: <Shield size={24} />, title: 'Adhesivo duradero', desc: 'Aguanta de -10°C a 70°C. Adhesión permanente en superficies lisas y rugosas.' },
  { icon: <Package2 size={24} />, title: 'Fácil de usar', desc: 'Cartucho reutilizable pre-instalado. Insertar y listo — sin configuración.' },
];

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

        {/* Feature blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {featureBlocks.map((f) => (
            <div key={f.title} className="bg-[var(--color-surface)] rounded-xl p-6 flex gap-4">
              <div className="text-[var(--color-primary)] flex-shrink-0 mt-0.5">{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <CompatiblePrinters compatibleWith={product.compatibleWith} model={product.model} />
        <SpecsTable product={product} />
        <FAQAccordion />
      </div>

      <StickyBuyBar product={product} />
    </>
  );
}
