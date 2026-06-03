'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';

const slides = [
  {
    headline: 'Etiquetas de calidad premium para tu impresora Brother',
    sub: 'Compatible con toda la serie QL. Envío a todo Bolivia.',
    cta: { label: 'Ver catálogo', href: '/catalogo', primary: true },
    gradient: 'from-[#1B2E5E] to-[#2D5FA6]',
  },
  {
    headline: 'Imprime sin complicaciones',
    sub: 'Solo insertás el cartucho y empezás a imprimir. Sin configuración extra.',
    cta: { label: 'Ver catálogo', href: '/catalogo', primary: true },
    gradient: 'from-[#1B3A6B] to-[#1B2E5E]',
  },
  {
    headline: '¿Tenés una impresora Brother QL?',
    sub: 'Nuestras etiquetas BETCKEY son 100% compatibles. Consultanos sin compromiso.',
    cta: { label: 'Consultar por WhatsApp', href: '#whatsapp', primary: false },
    gradient: 'from-[#0F2040] to-[#1B2E5E]',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const waUrl = buildWhatsAppDirectURL();

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const slide = slides[current];

  return (
    <section
      className={`relative bg-gradient-to-br ${slide.gradient} text-white transition-all duration-700 overflow-hidden`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative SVG pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 600 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 12 }).map((_, i) =>
            Array.from({ length: 8 }).map((_, j) => (
              <rect
                key={`${i}-${j}`}
                x={i * 55 - 20}
                y={j * 60 - 20}
                width="38"
                height="50"
                rx="4"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            ))
          )}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center gap-6">
        <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
          {slide.headline}
        </h1>
        <p className="text-lg text-blue-200 max-w-xl">{slide.sub}</p>
        <div>
          {slide.cta.href === '#whatsapp' ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-7 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              💬 {slide.cta.label}
            </a>
          ) : (
            <Link
              href={slide.cta.href}
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white px-7 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              {slide.cta.label}
            </Link>
          )}
        </div>
      </div>

      {/* Controls */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors" aria-label="Anterior">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors" aria-label="Siguiente">
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
