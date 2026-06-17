'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FAQItem = { question: string; answer: string };

export default function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (faqs.length === 0) return null;

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
              {faq.question}
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
