import Link from 'next/link';

const productLinks = [
  { href: '/productos/dk-1201', label: 'DK-1201 — Dirección 1.1" x 3.5"' },
  { href: '/productos/dk-1202', label: 'DK-1202 — Envío 2.4" x 3.9"' },
  { href: '/productos/dk-1241', label: 'DK-1241 — Envío 4" x 6"' },
  { href: '/productos/dk-2205', label: 'DK-2205 — Continua 2.4"' },
];

export default function Footer() {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? '';

  return (
    <footer className="bg-[var(--color-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">Productos</h3>
          <ul className="space-y-2">
            {productLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">Información</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><Link href="/catalogo" className="hover:text-white transition-colors">Ver catálogo completo</Link></li>
            <li><Link href="/#como-pedir" className="hover:text-white transition-colors">¿Cómo pedir?</Link></li>
            <li><Link href="/#trust" className="hover:text-white transition-colors">¿Por qué elegirnos?</Link></li>
          </ul>
        </div>

        <div id="contacto">
          <h3 className="font-bold text-lg mb-4">Contacto</h3>
          <p className="text-sm text-blue-200 mb-3">Pedidos y consultas por WhatsApp</p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            💬 Escríbenos por WhatsApp
          </a>
          <p className="text-xs text-blue-300 mt-4">Atención: Lunes a Sábado 9:00 - 20:00</p>
        </div>
      </div>

      <div className="border-t border-blue-800 py-4 text-center text-xs text-blue-300">
        © 2025 {brand} — Bolivia | Distribuidor de etiquetas BETCKEY
      </div>
    </footer>
  );
}
