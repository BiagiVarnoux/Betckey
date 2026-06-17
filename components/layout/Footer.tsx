import Link from 'next/link';
import { getContactInfo } from '@/lib/contact';
import { MessageCircle, Clock, MapPin } from 'lucide-react';

export default async function Footer() {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';
  const info = await getContactInfo();

  return (
    <footer className="bg-[var(--color-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Columna 1 — Marca */}
        <div>
          <h3 className="font-bold text-lg mb-2">{brand}</h3>
          <p className="text-sm text-blue-200 leading-relaxed">
            Distribuidor oficial de etiquetas BETCKEY en Bolivia. Envíos a todo el país.
          </p>
        </div>

        {/* Columna 2 — Navegar */}
        <div>
          <h3 className="font-bold text-lg mb-4">Navegar</h3>
          <ul className="space-y-2 text-sm text-blue-200">
            <li><Link href="/catalogo" className="hover:text-white transition-colors">Ver catálogo completo</Link></li>
            <li><Link href="/#como-pedir" className="hover:text-white transition-colors">¿Cómo pedir?</Link></li>
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>

        {/* Columna 3 — Contacto */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contacto</h3>
          <div className="flex flex-col gap-3">
            {info.whatsapp && (
              <a
                href={`https://wa.me/${info.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity w-fit"
              >
                <MessageCircle size={16} />
                Escríbenos por WhatsApp
              </a>
            )}
            {info.businessHours && (
              <p className="flex items-center gap-2 text-xs text-blue-300">
                <Clock size={13} />
                {info.businessHours}
              </p>
            )}
            {(info.address || info.city) && (
              <p className="flex items-center gap-2 text-xs text-blue-300">
                <MapPin size={13} />
                {[info.address, info.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-blue-800 py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} {brand} — Bolivia | Distribuidor de etiquetas BETCKEY
      </div>
    </footer>
  );
}
