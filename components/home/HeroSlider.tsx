'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';

const slides = [
  {
    headline: 'Etiquetas de calidad premium para tu impresora Brother',
    sub: 'Sin residuo, resistentes al agua y al desgarro. Envío a todo Bolivia.',
    cta: { label: 'Ver catálogo', href: '/catalogo', primary: true },
    image: '/hero-1.jpg',
  },
  {
    headline: 'Imprime sin complicaciones',
    sub: 'Compatible con toda la serie QL. Solo inserta el rollo y comienza a imprimir.',
    cta: { label: 'Ver catálogo', href: '/catalogo', primary: true },
    image: '/hero-2.jpg',
  },
  {
    headline: '¿Tienes una impresora Brother QL?',
    sub: 'Nuestras etiquetas BETCKEY son 100% compatibles. Consúltanos sin compromiso.',
    cta: { label: 'Consultar por WhatsApp', href: '#whatsapp', primary: false },
    image: '/hero-3.jpg',
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
      className="relative text-white overflow-hidden h-[480px] md:h-[580px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images — all stacked, fade in/out */}
      {slides.map((s, i) => (
        <div
          key={s.image}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${s.image})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-6">
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
