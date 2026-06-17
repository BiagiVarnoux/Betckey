'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';

export type SlideData = {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  ctaType: string;
  imageUrl: string | null;
};

export default function HeroSlider({ slides }: { slides: SlideData[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const waUrl = buildWhatsAppDirectURL();

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const slide = slides[current];

  return (
    <section
      className="relative text-white overflow-hidden h-[480px] md:h-[580px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
            backgroundColor: s.imageUrl ? undefined : 'var(--color-primary)',
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-6">
        <h1 className="text-3xl md:text-5xl font-bold max-w-3xl leading-tight">
          {slide.headline}
        </h1>
        {slide.sub && <p className="text-lg text-blue-200 max-w-xl">{slide.sub}</p>}
        <div>
          {slide.ctaType === 'whatsapp' ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-7 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              💬 {slide.ctaLabel}
            </a>
          ) : (
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white px-7 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              {slide.ctaLabel}
            </Link>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors" aria-label="Anterior">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors" aria-label="Siguiente">
            <ChevronRight size={24} />
          </button>
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
        </>
      )}
    </section>
  );
}
