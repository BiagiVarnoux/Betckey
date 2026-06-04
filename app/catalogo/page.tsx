import { getAllProducts } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo — Etiquetas Brother Bolivia',
  description: 'Catálogo completo de etiquetas BETCKEY compatibles con impresoras Brother QL. DK-1201, DK-1202, DK-1241, DK-2205. Envío a todo Bolivia.',
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim().toLowerCase() : '';
  const allProducts = await getAllProducts();
  const products = q
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.labelType.toLowerCase().includes(q) ||
          p.mainUse.toLowerCase().includes(q) ||
          p.compatibleWith.some((printer) => printer.toLowerCase().includes(q)),
      )
    : allProducts;
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
          {q && (
            <p className="text-sm text-gray-500 mb-6">
              {products.length > 0
                ? `${products.length} resultado${products.length !== 1 ? 's' : ''} para "${q}"`
                : `Sin resultados para "${q}"`}
            </p>
          )}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No encontramos productos con ese nombre.</p>
              <a href="/catalogo" className="mt-4 inline-block text-[var(--color-primary)] underline text-sm">Ver todo el catálogo</a>
            </div>
          )}
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
