import { buildWhatsAppDirectURL } from '@/lib/whatsapp';

const steps = [
  { num: '1', title: 'Elegí tu etiqueta', desc: 'Buscá el modelo compatible con tu impresora Brother QL en nuestro catálogo.' },
  { num: '2', title: 'Escribinos por WhatsApp', desc: 'Envianos un mensaje con el modelo y la cantidad que necesitás. Te respondemos al momento.' },
  { num: '3', title: 'Recibí tu pedido', desc: 'Coordinamos el envío a tu ciudad. Entregamos en todo Bolivia.' },
];

export default function HowToOrder() {
  const waUrl = buildWhatsAppDirectURL();

  return (
    <section id="como-pedir" className="bg-[var(--color-surface)] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-primary)]">¿Cómo pedir?</h2>
          <p className="text-gray-500 mt-2">Tres pasos simples para recibir tus etiquetas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl font-bold mb-4">
                {s.num}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[var(--color-whatsapp)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            💬 Hacer mi pedido por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
