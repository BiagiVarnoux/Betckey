import type { ProductWithImages } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';

interface Props {
  products: ProductWithImages[];
}

export default function ProductsGrid({ products }: Props) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--color-primary)]">Nuestros Productos</h2>
          <p className="text-gray-500 mt-2">Etiquetas BETCKEY compatibles con impresoras Brother QL</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} showBadge={i < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
