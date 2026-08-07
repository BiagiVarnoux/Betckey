'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Printer, Ruler, Tag, X, PackageX } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import type { CompatibilityData } from '@/lib/compatibility';
import { sizeKey } from '@/lib/compatibility';

export type SearchMode = 'modelo' | 'medidas' | 'impresora';

const MODES: { id: SearchMode; label: string; icon: React.ReactNode }[] = [
  { id: 'impresora', label: 'Por impresora', icon: <Printer size={15} /> },
  { id: 'medidas',   label: 'Por medidas',   icon: <Ruler size={15} /> },
  { id: 'modelo',    label: 'Por modelo',    icon: <Tag size={15} /> },
];

const selectCls =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-[var(--color-primary)] transition-colors';

/** Tolerancia al buscar una medida escrita a mano. */
const TOLERANCE_MM = 2;

export default function CompatibilityFinder({
  data,
  initial,
}: {
  data: CompatibilityData;
  initial?: { brand?: string; mode?: SearchMode; printerId?: number; size?: string; model?: string };
}) {
  const { brands, printersByBrand, sizesByBrand, products } = data;

  const [brand, setBrand] = useState(initial?.brand && brands.includes(initial.brand) ? initial.brand : brands[0] ?? '');
  const [mode, setMode] = useState<SearchMode>(initial?.mode ?? 'impresora');
  const [printerId, setPrinterId] = useState<string>(initial?.printerId ? String(initial.printerId) : '');
  const [size, setSize] = useState<string>(initial?.size ?? '');
  const [model, setModel] = useState<string>(initial?.model ?? '');
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  const printerOptions = printersByBrand[brand] ?? [];
  const sizeOptions = sizesByBrand[brand] ?? [];

  // Al cambiar de marca, los filtros anteriores ya no aplican
  useEffect(() => {
    setPrinterId(''); setSize(''); setModel(''); setCustomW(''); setCustomH('');
  }, [brand]);

  const usingCustomSize = customW !== '' || customH !== '';

  const results = useMemo(() => {
    const ofBrand = products.filter(p => p.brand === brand);

    if (mode === 'impresora') {
      if (!printerId) return ofBrand;
      return ofBrand.filter(p => p.printerIds.includes(Number(printerId)));
    }

    if (mode === 'medidas') {
      if (usingCustomSize) {
        const w = customW === '' ? null : Number(customW);
        const h = customH === '' ? null : Number(customH);
        return ofBrand.filter(p =>
          (w === null || Math.abs(p.widthMm - w) <= TOLERANCE_MM) &&
          (h === null || Math.abs(p.heightMm - h) <= TOLERANCE_MM)
        );
      }
      if (!size) return ofBrand;
      return ofBrand.filter(p => sizeKey(p.widthMm, p.heightMm) === size);
    }

    const q = model.trim().toLowerCase();
    if (!q) return ofBrand;
    return ofBrand.filter(p =>
      p.model.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [products, brand, mode, printerId, size, model, customW, customH, usingCustomSize]);

  const hasFilter =
    (mode === 'impresora' && printerId) ||
    (mode === 'medidas' && (size || usingCustomSize)) ||
    (mode === 'modelo' && model.trim());

  function clearFilters() {
    setPrinterId(''); setSize(''); setModel(''); setCustomW(''); setCustomH('');
  }

  if (brands.length === 0) {
    return <p className="text-center text-gray-500 py-10">Todavía no hay productos cargados.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-5">
        {/* Marca */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">1 · Marca de tu impresora</span>
          <div className="flex flex-wrap gap-2">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  brand === b
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary)]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de búsqueda */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">2 · ¿Cómo querés buscar?</span>
          <div className="flex flex-wrap gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); clearFilters(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  mode === m.id
                    ? 'bg-[var(--color-primary)]/8 text-[var(--color-primary)] border-[var(--color-primary)]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Control según el modo */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3 · Elegí tu opción</span>

          {mode === 'impresora' && (
            printerOptions.length ? (
              <select value={printerId} onChange={e => setPrinterId(e.target.value)} className={selectCls}>
                <option value="">Todas las impresoras {brand}</option>
                {printerOptions.map(p => <option key={p.id} value={p.id}>{p.model}</option>)}
              </select>
            ) : (
              <p className="text-sm text-gray-500">Todavía no hay impresoras {brand} cargadas.</p>
            )
          )}

          {mode === 'medidas' && (
            <div className="flex flex-col gap-3">
              <select
                value={size}
                onChange={e => { setSize(e.target.value); setCustomW(''); setCustomH(''); }}
                className={selectCls}
                disabled={usingCustomSize}
              >
                <option value="">Todas las medidas</option>
                {sizeOptions.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 shrink-0">o escribí la medida</span>
                <div className="h-px bg-gray-100 flex-1" />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" placeholder="Ancho mm" value={customW}
                  onChange={e => { setCustomW(e.target.value); setSize(''); }}
                  className={selectCls}
                />
                <span className="text-gray-300">×</span>
                <input
                  type="number" min="0" placeholder="Alto mm" value={customH}
                  onChange={e => { setCustomH(e.target.value); setSize(''); }}
                  className={selectCls}
                />
              </div>
              <p className="text-xs text-gray-400">
                Buscamos con un margen de ±{TOLERANCE_MM}mm. Dejá el alto vacío si tu rollo es continuo.
              </p>
            </div>
          )}

          {mode === 'modelo' && (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text" value={model} onChange={e => setModel(e.target.value)}
                  placeholder={`Ej: ${products.find(p => p.brand === brand)?.model ?? 'DK-1201'}`}
                  list="modelos-compatibilidad"
                  className={`${selectCls} pl-10`}
                />
              </div>
              <datalist id="modelos-compatibilidad">
                {products.filter(p => p.brand === brand).map(p => <option key={p.id} value={p.model} />)}
              </datalist>
            </>
          )}
        </div>

        {hasFilter && (
          <button onClick={clearFilters} className="self-start flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
            <X size={13} /> Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Resultados */}
      <div>
        <p className="text-sm text-gray-500 mb-4">
          {results.length === 0
            ? 'Sin resultados'
            : `${results.length} ${results.length === 1 ? 'etiqueta compatible' : 'etiquetas compatibles'}`}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-2xl">
            <PackageX size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm mb-1">No encontramos etiquetas con esos filtros.</p>
            <p className="text-gray-400 text-xs">Probá con otra medida o escribinos y te ayudamos a identificarla.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
