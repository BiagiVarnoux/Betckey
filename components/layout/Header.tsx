'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'EtiBolivia';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function openSearch() {
    setSearchOpen(true);
    setQuery('');
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeSearch();
    router.push(`/catalogo?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 relative ${
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

        {/* Search bar inline */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="absolute inset-x-0 top-0 h-16 bg-white flex items-center px-4 gap-2 z-10">
            <button type="button" onClick={closeSearch} className="p-2 text-gray-400 hover:text-gray-600" aria-label="Cerrar búsqueda">
              <X size={20} />
            </button>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar etiquetas..."
              className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
            />
            <button type="submit" className="p-2 text-[var(--color-primary)]" aria-label="Buscar">
              <Search size={20} />
            </button>
          </form>
        )}

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button onClick={openSearch} className="p-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors" aria-label="Buscar">
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
