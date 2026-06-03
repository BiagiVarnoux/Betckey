'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, MessageCircle, Search } from 'lucide-react';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/#como-pedir', label: '¿Cómo pedir?' },
  { href: '/#contacto', label: 'Contacto' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-bold text-xl text-[var(--color-primary)]">{brandName}</span>
          <span className="text-xs text-gray-500">Etiquetas Premium Brother</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors" aria-label="Buscar">
            <Search size={20} />
          </button>
          <a
            href={buildWhatsAppDirectURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[var(--color-whatsapp)] hover:opacity-80 transition-opacity"
            aria-label="WhatsApp"
          >
            <MessageCircle size={22} />
          </a>
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(true)}
            aria-label="Menú"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-black/40 flex-1" onClick={() => setMenuOpen(false)} />
          <div className="w-72 bg-white h-full flex flex-col p-6 shadow-xl animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-[var(--color-primary)]">{brandName}</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-base font-medium text-gray-800 hover:text-[var(--color-primary)] py-2 border-b border-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
