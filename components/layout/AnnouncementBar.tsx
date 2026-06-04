'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK = [
  '🚀 Envío a todo Bolivia | Consulta disponibilidad por WhatsApp',
  '✅ Etiquetas 100% compatibles con impresoras Brother QL',
  '📦 Vendemos por unidad — sin mínimo de compra',
];

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch('/api/anuncio')
      .then((r) => r.json())
      .then((data: { text: string; isActive: boolean }[]) => {
        const active = data.filter((m) => m.isActive).map((m) => m.text);
        setMessages(active.length > 0 ? active : FALLBACK);
      })
      .catch(() => setMessages(FALLBACK));
  }, []);

  const total = messages.length;

  useEffect(() => {
    if (total === 0) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % total);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  if (messages.length === 0) return null;

  return (
    <div className="bg-[var(--color-announce-bg)] text-[var(--color-announce-text)] text-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {total > 1 && (
          <button onClick={prev} className="hover:opacity-70 transition-opacity" aria-label="Anterior">
            <ChevronLeft size={16} />
          </button>
        )}
        <span
          className="text-center transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {messages[current]}
        </span>
        {total > 1 && (
          <button onClick={next} className="hover:opacity-70 transition-opacity" aria-label="Siguiente">
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
