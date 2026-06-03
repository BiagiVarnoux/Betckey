import { getAllProducts } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo — Etiquetas Brother Bolivia',
  description: 'Catálogo completo de etiquetas BETCKEY compatibles con impresoras Brother QL. DK-1201, DK-1202, DK-1241, DK-2205. Envío a todo Bolivia.',
};

export default async function CatalogoPage() {
  const products = await getAllProducts();
  const waUrl = buildWhatsAppDirectURL();

  return (
    <>
      <section className="bg-[var(--color-primary)] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Catálogo de Etiquetas</h1>
          <p className="text-blue-200 text-lg">
            Etiquetas BETCKEY compatibles con impresoras Brother QL — envío a todo Bolivia
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2">¿No sabés qué modelo necesitás?</h2>
          <p className="text-gray-500 mb-6">Contanos el modelo de tu impresora Brother y te ayudamos a elegir la etiqueta correcta.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
