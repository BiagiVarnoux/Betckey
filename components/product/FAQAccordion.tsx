'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: '¿Estas etiquetas son originales Brother?',
    a: 'No, son etiquetas compatibles de la marca BETCKEY, importadas desde USA. Están diseñadas para funcionar exactamente igual que las originales Brother, con la misma calidad de impresión y adhesivo, pero a un precio más accesible.',
  },
  {
    q: '¿Necesito configurar mi impresora?',
    a: 'No. Solo inserta el cartucho directamente en tu impresora Brother QL y comienza a imprimir. Las etiquetas BETCKEY vienen con cartuchos reutilizables pre-instalados, sin necesidad de configuración adicional.',
  },
  {
    q: '¿Puedo comprar solo 1 rollo?',
    a: 'Sí, vendemos por unidad sin mínimo de compra. Puedes pedir el rollo que necesitas y coordinamos el envío a tu ciudad.',
  },
  {
    q: '¿Hacen envíos a mi ciudad?',
    a: 'Enviamos a todo Bolivia. Coordinamos el despacho por WhatsApp, donde te informamos los tiempos de entrega y opciones de envío disponibles para tu zona.',
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="py-8 border-t border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {faq.q}
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
