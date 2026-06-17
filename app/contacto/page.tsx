import { getContactInfo } from '@/lib/contact';
import { MessageCircle, Mail, MapPin, Clock, Phone } from 'lucide-react';

export const metadata = {
  title: 'Contacto',
  description: 'Contáctanos por WhatsApp, correo o visítanos. Estamos para ayudarte.',
};

export default async function ContactoPage() {
  const info = await getContactInfo();
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  return (
    <main>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative bg-[var(--color-primary)] overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-10 left-1/3 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">
            Estamos aquí para ayudarte
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contáctanos
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Respondemos por WhatsApp en minutos. También puedes escribirnos al correo o visitarnos en nuestra dirección.
          </p>
        </div>
      </section>

      {/* ── TRES ÍCONOS DE CONTACTO ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {/* Texto decorativo de fondo */}
          <p className="text-5xl font-bold text-gray-100 select-none -mb-8 tracking-widest">
            Contacto
          </p>
          <h2 className="relative text-2xl font-bold text-gray-900">
            Información de contacto
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* WhatsApp / Teléfono */}
          {(info.whatsapp || info.phone) && (
            <a
              href={info.whatsapp ? `https://wa.me/${info.whatsapp}` : undefined}
              target={info.whatsapp ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)] transition-colors">
                <Phone size={28} className="text-[var(--color-primary)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Teléfono</h3>
              {info.phone && <p className="text-gray-700 font-medium">{info.phone}</p>}
              {info.whatsapp && (
                <p className="text-sm text-gray-500 mt-1">+{info.whatsapp}</p>
              )}
              {info.whatsapp && (
                <p className="text-xs text-[var(--color-primary)] font-semibold mt-3 group-hover:underline">
                  Abrir en WhatsApp →
                </p>
              )}
            </a>
          )}

          {/* Email */}
          {info.email && (
            <a
              href={`mailto:${info.email}`}
              className="group flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)] transition-colors">
                <Mail size={28} className="text-[var(--color-primary)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Correo</h3>
              <p className="text-gray-700 font-medium break-all">{info.email}</p>
              <p className="text-xs text-[var(--color-primary)] font-semibold mt-3 group-hover:underline">
                Enviar correo →
              </p>
            </a>
          )}

          {/* Dirección */}
          {(info.address || info.city) && (
            <div className="group flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)] transition-colors">
                <MapPin size={28} className="text-[var(--color-primary)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Dirección</h3>
              {info.address && <p className="text-gray-700 font-medium">{info.address}</p>}
              {info.city && <p className="text-sm text-gray-500 mt-1">{info.city}</p>}
            </div>
          )}

        </div>
      </section>

      {/* ── SECCIÓN GET IN TOUCH (WhatsApp) ─────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Texto izquierda */}
          <div>
            <p className="text-4xl font-bold text-gray-100 select-none -mb-6 tracking-widest">Form</p>
            <h2 className="relative text-3xl font-bold text-gray-900 mb-4">
              ¡Escríbenos ahora!
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              La forma más rápida de contactarnos es por WhatsApp. Respondemos en minutos y coordinamos todo: precios, modelos, cantidades y envío a tu ciudad.
            </p>
            {info.businessHours && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Clock size={16} className="text-[var(--color-primary)] shrink-0" />
                <span>{info.businessHours}</span>
              </div>
            )}
          </div>

          {/* CTA derecha */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col gap-4">
            <p className="text-sm text-gray-500 text-center">Selecciona cómo quieres contactarnos</p>

            {info.whatsapp && (
              <a
                href={`https://wa.me/${info.whatsapp}?text=Hola%20${encodeURIComponent(brand)}%2C%20tengo%20una%20consulta`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[var(--color-whatsapp)] text-white px-6 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={22} />
                Escribir por WhatsApp
              </a>
            )}

            {info.email && (
              <a
                href={`mailto:${info.email}?subject=Consulta%20sobre%20etiquetas`}
                className="flex items-center justify-center gap-3 bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-4 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors"
              >
                <Mail size={20} />
                Enviar un correo
              </a>
            )}

            <p className="text-xs text-gray-400 text-center">
              Tiempo de respuesta estimado: menos de 30 minutos en horario de atención
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
