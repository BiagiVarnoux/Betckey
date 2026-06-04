'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, MessageCircle, Search, ChevronDown } from 'lucide-react';
import { buildWhatsAppDirectURL } from '@/lib/whatsapp';

// Estructura de marcas — agregar Dymo, Zebra, etc. aquí cuando estén disponibles
const brandMenus = [
  {
    label: 'Brother',
    slug: 'brother',
    columns: [
      {
        title: 'Por Modelo',
        items: [
          { label: 'DK-1201', href: '/catalogo?modelo=DK-1201' },
          { label: 'DK-1202', href: '/catalogo?modelo=DK-1202' },
          { label: 'DK-1241', href: '/catalogo?modelo=DK-1241' },
          { label: 'DK-2205', href: '/catalogo?modelo=DK-2205' },
        ],
        viewAll: { label: 'Ver todos', href: '/catalogo?marca=brother' },
      },
      {
        title: 'Por Medida',
        items: [
          { label: '1.1" x 3.5"', href: '/catalogo?medida=1.1x3.5' },
          { label: '2.4" x 3.9"', href: '/catalogo?medida=2.4x3.9' },
          { label: '4" x 6"',     href: '/catalogo?medida=4x6' },
          { label: '2.4" x 100\'', href: '/catalogo?medida=2.4x100' },
        ],
        viewAll: { label: 'Ver todos', href: '/catalogo?marca=brother' },
      },
      {
        title: 'Por Impresora',
        items: [
          { label: 'QL-500',     href: '/catalogo?printer=QL-500' },
          { label: 'QL-700',     href: '/catalogo?printer=QL-700' },
          { label: 'QL-800',     href: '/catalogo?printer=QL-800' },
          { label: 'QL-1050',    href: '/catalogo?printer=QL-1050' },
          { label: 'QL-1100',    href: '/catalogo?printer=QL-1100' },
          { label: 'QL-1110NWB', href: '/catalogo?printer=QL-1110NWB' },
        ],
        viewAll: { label: 'Ver todos', href: '/catalogo?marca=brother' },
      },
    ],
  },
];

const staticLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/#como-pedir', label: '¿Cómo pedir?' },
  { href: '/#contacto', label: 'Contacto' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [mobileOpenBrand, setMobileOpenBrand] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenBrand(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function openSearch() { setSearchOpen(true); setQuery(''); }
  function closeSearch() { setSearchOpen(false); setQuery(''); }

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
        <nav className="hidden md:flex items-center gap-6" ref={dropdownRef}>
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors"
          >
            Inicio
          </Link>

          {/* Brand dropdowns */}
          {brandMenus.map((brand) => (
            <div key={brand.slug} className="relative">
              <button
                onClick={() => setOpenBrand(openBrand === brand.slug ? null : brand.slug)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors"
              >
                {brand.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${openBrand === brand.slug ? 'rotate-180' : ''}`}
                />
              </button>

              {openBrand === brand.slug && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-6 grid grid-cols-3 gap-8 min-w-[600px]">
                  {brand.columns.map((col) => (
                    <div key={col.title}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {col.title}
                      </p>
                      <ul className="space-y-2">
                        {col.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setOpenBrand(null)}
                              className="text-sm text-gray-700 hover:text-[var(--color-primary)] transition-colors"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={col.viewAll.href}
                        onClick={() => setOpenBrand(null)}
                        className="mt-3 block text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        {col.viewAll.label} →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {staticLinks.slice(1).map((l) => (
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
          <div className="w-72 bg-white h-full flex flex-col p-6 shadow-xl animate-slide-in-right overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-[var(--color-primary)]">{brandName}</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="text-base font-medium text-gray-800 hover:text-[var(--color-primary)] py-2 border-b border-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Inicio
              </Link>

              {/* Brand accordions mobile */}
              {brandMenus.map((brand) => (
                <div key={brand.slug} className="border-b border-gray-100">
                  <button
                    onClick={() => setMobileOpenBrand(mobileOpenBrand === brand.slug ? null : brand.slug)}
                    className="w-full flex items-center justify-between text-base font-medium text-gray-800 py-2"
                  >
                    {brand.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${mobileOpenBrand === brand.slug ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {mobileOpenBrand === brand.slug && (
                    <div className="pl-3 pb-3 space-y-4">
                      {brand.columns.map((col) => (
                        <div key={col.title}>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{col.title}</p>
                          <ul className="space-y-1">
                            {col.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMenuOpen(false)}
                                  className="text-sm text-gray-700 hover:text-[var(--color-primary)]"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link
                            href={col.viewAll.href}
                            onClick={() => setMenuOpen(false)}
                            className="mt-2 block text-xs font-semibold text-[var(--color-primary)]"
                          >
                            {col.viewAll.label} →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {staticLinks.slice(1).map((l) => (
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
