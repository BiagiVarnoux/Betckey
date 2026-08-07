'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Ruler, Tag, Search, ArrowRight } from 'lucide-react';
import type { CompatibilityData } from '@/lib/compatibility';

type Mode = 'impresora' | 'medidas' | 'modelo';

const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
  { id: 'impresora', label: 'Por impresora', icon: <Printer size={15} /> },
  { id: 'medidas',   label: 'Por medidas',   icon: <Ruler size={15} /> },
  { id: 'modelo',    label: 'Por modelo',    icon: <Tag size={15} /> },
];

const controlCls =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-[var(--color-primary)] transition-colors';

export default function CompatibilityTeaser({ data }: { data: CompatibilityData }) {
  const router = useRouter();
  const { brands, printersByBrand, sizesByBrand, products } = data;

  const [brand, setBrand] = useState(brands[0] ?? '');
  const [mode, setMode] = useState<Mode>('impresora');
  const [value, setValue] = useState('');

  useEffect(() => { setValue(''); }, [brand, mode]);

  if (brands.length === 0) return null;

  function search() {
    const params = new URLSearchParams({ marca: brand, buscar: mode });
    if (value) {
      params.set(mode === 'impresora' ? 'impresora' : mode === 'medidas' ? 'medida' : 'modelo', value);
    }
    router.push(`/compatibilidad?${params}`);
  }

  const printerOptions = printersByBrand[brand] ?? [];
  const sizeOptions = sizesByBrand[brand] ?? [];

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--color-primary)]">¿Qué etiqueta necesitás?</h2>
          <p className="text-gray-500 mt-2">Encontrá la compatible con tu impresora en dos clics</p>
        </div>

        <div className="bg-[var(--color-surface)] border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          {/* Marca */}
          <div className="flex flex-wrap gap-2 justify-center">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  brand === b
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary)]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 items-center">
            {/* Tipo de búsqueda */}
            <div className="flex gap-1.5 flex-wrap">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                    mode === m.id
                      ? 'bg-[var(--color-primary)]/8 text-[var(--color-primary)] border-[var(--color-primary)]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* Control */}
            {mode === 'impresora' && (
              <select value={value} onChange={e => setValue(e.target.value)} className={controlCls}>
                <option value="">Elegí tu impresora {brand}</option>
                {printerOptions.map(p => <option key={p.id} value={p.id}>{p.model}</option>)}
              </select>
            )}
            {mode === 'medidas' && (
              <select value={value} onChange={e => setValue(e.target.value)} className={controlCls}>
                <option value="">Elegí la medida</option>
                {sizeOptions.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            )}
            {mode === 'modelo' && (
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text" value={value} onChange={e => setValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') search(); }}
                  placeholder={`Ej: ${products.find(p => p.brand === brand)?.model ?? 'DK-1201'}`}
                  className={`${controlCls} pl-10`}
                />
              </div>
            )}

            <button
              onClick={search}
              className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Buscar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
