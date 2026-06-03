'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const messages = [
  '🚀 Envío a todo Bolivia | Consultá disponibilidad por WhatsApp',
  '✅ Etiquetas 100% compatibles con impresoras Brother QL',
  '📦 Vendemos por unidad — sin mínimo de compra',
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + messages.length) % messages.length);
  const next = () => setCurrent((c) => (c + 1) % messages.length);

  return (
    <div className="bg-[var(--color-announce-bg)] text-[var(--color-announce-text)] text-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <button onClick={prev} className="hover:opacity-70 transition-opacity" aria-label="Anterior">
          <ChevronLeft size={16} />
        </button>
        <span
          className="text-center transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {messages[current]}
        </span>
        <button onClick={next} className="hover:opacity-70 transition-opacity" aria-label="Siguiente">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
