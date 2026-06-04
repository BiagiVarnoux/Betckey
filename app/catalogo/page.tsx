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

function getParam(v: string | string[] | undefined): string {
  return typeof v === 'string' ? v.trim() : '';
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const q       = getParam(params.q).toLowerCase();
  const modelo  = getParam(params.modelo).toUpperCase();
  const printer = getParam(params.printer).toUpperCase();
  const medida  = getParam(params.medida).toLowerCase();

  const allProducts = await getAllProducts();

  const products = allProducts.filter((p) => {
    if (modelo  && p.model.toUpperCase() !== modelo) return false;
    if (printer && !p.compatibleWith.some((c) => c.toUpperCase() === printer)) return false;
    if (medida) {
      const size = `${p.widthIn}x${p.heightIn}`.toLowerCase().replace(/["\s]/g, '');
      if (!size.includes(medida.replace(/["\s]/g, ''))) return false;
    }
    if (q) {
      return (
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.labelType.toLowerCase().includes(q) ||
        p.mainUse.toLowerCase().includes(q) ||
        p.compatibleWith.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Etiqueta del filtro activo para mostrar en UI
  const activeFilter = modelo || printer || (medida ? `Medida ${medida}` : '') || (q ? `"${q}"` : '');
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
          {activeFilter && (
            <p className="text-sm text-gray-500 mb-6">
              {products.length > 0
                ? `${products.length} producto${products.length !== 1 ? 's' : ''} — ${activeFilter}`
                : `Sin resultados para ${activeFilter}`}
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
              <a href="/catalogo?marca=brother" className="mt-4 inline-block text-[var(--color-primary)] underline text-sm">Ver todo el catálogo Brother</a>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2">¿No sabes qué modelo necesitas?</h2>
          <p className="text-gray-500 mb-6">Cuéntanos el modelo de tu impresora Brother y te ayudamos a elegir la etiqueta correcta.</p>
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
