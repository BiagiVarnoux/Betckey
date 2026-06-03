import { getFeaturedProducts } from '@/lib/products';
import HeroSlider from '@/components/home/HeroSlider';
import TrustBadges from '@/components/home/TrustBadges';
import ProductsGrid from '@/components/home/ProductsGrid';
import HowToOrder from '@/components/home/HowToOrder';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <HeroSlider />
      <TrustBadges />
      <ProductsGrid products={products} />
      <HowToOrder />
    </>
  );
}
