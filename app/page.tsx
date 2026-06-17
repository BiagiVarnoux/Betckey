import { getFeaturedProducts } from '@/lib/products';
import HeroSlider, { type SlideData } from '@/components/home/HeroSlider';
import TrustBadges from '@/components/home/TrustBadges';
import ProductsGrid from '@/components/home/ProductsGrid';
import HowToOrder from '@/components/home/HowToOrder';
import { getDb } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const FALLBACK_SLIDES: SlideData[] = [
  {
    headline: 'Etiquetas de calidad premium para tu impresora Brother',
    sub: 'Sin residuo, resistentes al agua y al desgarro. Envío a todo Bolivia.',
    ctaLabel: 'Ver catálogo', ctaHref: '/catalogo', ctaType: 'primary', imageUrl: '/hero-1.jpg',
  },
  {
    headline: 'Imprime sin complicaciones',
    sub: 'Compatible con toda la serie QL. Solo inserta el rollo y comienza a imprimir.',
    ctaLabel: 'Ver catálogo', ctaHref: '/catalogo', ctaType: 'primary', imageUrl: '/hero-2.jpg',
  },
  {
    headline: '¿Tienes una impresora Brother QL?',
    sub: 'Nuestras etiquetas BETCKEY son 100% compatibles. Consúltanos sin compromiso.',
    ctaLabel: 'Consultar por WhatsApp', ctaHref: '/contacto', ctaType: 'whatsapp', imageUrl: '/hero-3.jpg',
  },
];

export default async function HomePage() {
  const [products, dbSlides] = await Promise.all([
    getFeaturedProducts(),
    getDb().select().from(heroSlides).where(eq(heroSlides.isActive, true)).orderBy(asc(heroSlides.sortOrder)),
  ]);

  const slides: SlideData[] = dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES;

  return (
    <>
      <HeroSlider slides={slides} />
      <TrustBadges />
      <ProductsGrid products={products} />
      <HowToOrder />
    </>
  );
}
