import { getContactInfo } from '@/lib/contact';
import { MessageCircle, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'Contacto',
  description: 'Contáctanos por WhatsApp, correo o visítanos en nuestra dirección.',
};

export default async function ContactoPage() {
  const info = await getContactInfo();
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Contacto</h1>
        <p className="text-gray-500 mt-2">Estamos para ayudarte. Escríbenos por WhatsApp o por cualquiera de los canales de abajo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {info.whatsapp && (
          <a
            href={`https://wa.me/${info.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 hover:bg-green-100 transition-colors"
          >
            <span className="mt-0.5 bg-green-500 text-white rounded-full p-2">
              <MessageCircle size={20} />
            </span>
            <div>
              <p className="font-semibold text-green-800">WhatsApp</p>
              <p className="text-sm text-green-700 mt-0.5">+{info.whatsapp}</p>
              <p className="text-xs text-green-600 mt-1">Toca para abrir chat →</p>
            </div>
          </a>
        )}

        {info.email && (
          <a
            href={`mailto:${info.email}`}
            className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:bg-blue-100 transition-colors"
          >
            <span className="mt-0.5 bg-blue-500 text-white rounded-full p-2">
              <Mail size={20} />
            </span>
            <div>
              <p className="font-semibold text-blue-800">Correo electrónico</p>
              <p className="text-sm text-blue-700 mt-0.5 break-all">{info.email}</p>
            </div>
          </a>
        )}

        {info.phone && (
          <div className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <span className="mt-0.5 bg-gray-500 text-white rounded-full p-2">
              <Phone size={20} />
            </span>
            <div>
              <p className="font-semibold text-gray-800">Teléfono</p>
              <p className="text-sm text-gray-600 mt-0.5">{info.phone}</p>
            </div>
          </div>
        )}

        {info.businessHours && (
          <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <span className="mt-0.5 bg-amber-500 text-white rounded-full p-2">
              <Clock size={20} />
            </span>
            <div>
              <p className="font-semibold text-amber-800">Horario de atención</p>
              <p className="text-sm text-amber-700 mt-0.5">{info.businessHours}</p>
            </div>
          </div>
        )}

        {(info.address || info.city) && (
          <div className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:col-span-2">
            <span className="mt-0.5 bg-gray-500 text-white rounded-full p-2">
              <MapPin size={20} />
            </span>
            <div>
              <p className="font-semibold text-gray-800">Ubicación</p>
              {info.address && <p className="text-sm text-gray-600 mt-0.5">{info.address}</p>}
              {info.city && <p className="text-sm text-gray-500">{info.city}</p>}
            </div>
          </div>
        )}
      </div>

      {info.whatsapp && (
        <div className="mt-10 text-center">
          <a
            href={`https://wa.me/${info.whatsapp}?text=Hola%20${encodeURIComponent(brand)}%2C%20tengo%20una%20consulta`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-8 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={22} />
            Escribirnos por WhatsApp
          </a>
        </div>
      )}
    </main>
  );
}
