'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductWithImages } from '@/lib/products';
import {
  Save, CheckCircle, Plus, X,
  Tag, Settings2, Search, ImageIcon,
} from 'lucide-react';
import ImageManager from '@/components/admin/ImageManager';

// ─── Helpers ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function ArrayField({
  label, hint, values, onChange,
}: {
  label: string; hint?: string; values: string[]; onChange: (v: string[]) => void;
}) {
  function update(i: number, val: string) {
    const next = [...values]; next[i] = val; onChange(next);
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="flex flex-col gap-2 mt-1">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text" value={v}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline w-fit"
        >
          <Plus size={13} /> Agregar
        </button>
      </div>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

type Tab = 'general' | 'specs' | 'seo' | 'images';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general',  label: 'General',          icon: <Tag size={15} /> },
  { id: 'specs',    label: 'Especificaciones',  icon: <Settings2 size={15} /> },
  { id: 'seo',      label: 'SEO y contenido',   icon: <Search size={15} /> },
  { id: 'images',   label: 'Imágenes',          icon: <ImageIcon size={15} /> },
];

// ─── Main component ─────────────────────────────────────────────────────────

export default function EditProductForm({ product }: { product: ProductWithImages }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('general');

  const [form, setForm] = useState({
    // Precios y estado (panel derecho)
    priceBob:     product.priceBob ?? '',
    priceUsd:     product.priceUsd ?? '',
    stock:        product.stock ?? '',
    isActive:     product.isActive,
    isFeatured:   product.isFeatured,
    sortOrder:    product.sortOrder,
    // General
    name:         product.name,
    model:        product.model,
    slug:         product.slug,
    mainUse:      product.mainUse,
    // Especificaciones
    labelType:    product.labelType,
    widthMm:      product.widthMm,
    heightMm:     product.heightMm,
    widthIn:      product.widthIn,
    heightIn:     product.heightIn,
    unitsPerRoll: product.unitsPerRoll,
    printType:    product.printType,
    material:     product.material,
    labelColor:   product.labelColor,
    adhesiveType: product.adhesiveType,
    rollCoreMm:   product.rollCoreMm,
    // SEO y contenido
    description:     product.description ?? '',
    metaDescription: product.metaDescription ?? '',
    features:        product.features,
    compatibleWith:  product.compatibleWith,
    // Especificaciones libres
    specs:           product.specs as { label: string; value: string }[],
  });

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');

    const res = await fetch(`/api/productos/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        priceBob:     form.priceBob     !== '' ? form.priceBob     : null,
        priceUsd:     form.priceUsd     !== '' ? form.priceUsd     : null,
        stock:        form.stock        !== '' ? Number(form.stock) : null,
        sortOrder:    Number(form.sortOrder),
        widthMm:      Number(form.widthMm),
        heightMm:     Number(form.heightMm),
        unitsPerRoll: Number(form.unitsPerRoll),
        description:     form.description     || null,
        metaDescription: form.metaDescription || null,
        compatibleWith:  form.compatibleWith.filter(Boolean),
        features:        form.features.filter(Boolean),
        specs:           form.specs.filter((s) => s.label.trim() || s.value.trim()),
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } else {
      setError('Error al guardar. Intentá de nuevo.');
    }
    setSaving(false);
  }

  // ─── Tab content ──────────────────────────────────────────────────────────

  const tabContent: Record<Tab, React.ReactNode> = {
    general: (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre del producto">
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              className={inputCls} required />
          </Field>
          <Field label="Modelo" hint="Ej: DK-1201, DK-2205">
            <input type="text" value={form.model} onChange={(e) => set('model', e.target.value)}
              className={inputCls} required />
          </Field>
        </div>
        <Field label="Slug (URL)" hint={`URL pública: /productos/${form.slug}`}>
          <input
            type="text" value={form.slug}
            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className={inputCls} required
          />
        </Field>
        <Field label="Uso principal" hint="Frase corta que describe para qué sirve.">
          <input type="text" value={form.mainUse} onChange={(e) => set('mainUse', e.target.value)}
            className={inputCls} required />
        </Field>
      </div>
    ),

    specs: (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Definí las especificaciones que aparecerán en la tabla de la página del producto.
          Podés agregar cualquier atributo en el orden que quieras.
        </p>

        {/* Header */}
        {form.specs.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nombre</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Valor</span>
          </div>
        )}

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {form.specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input
                type="text"
                placeholder="Ej: Ancho"
                value={spec.label}
                onChange={(e) => {
                  const next = [...form.specs];
                  next[i] = { ...next[i], label: e.target.value };
                  set('specs', next);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input
                type="text"
                placeholder="Ej: 62mm"
                value={spec.value}
                onChange={(e) => {
                  const next = [...form.specs];
                  next[i] = { ...next[i], value: e.target.value };
                  set('specs', next);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={() => set('specs', form.specs.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => set('specs', [...form.specs, { label: '', value: '' }])}
          className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline w-fit"
        >
          <Plus size={13} /> Agregar especificación
        </button>

        {form.specs.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
            Sin especificaciones todavía. Hacé clic en "Agregar especificación".
          </div>
        )}
      </div>
    ),

    seo: (
      <div className="flex flex-col gap-5">
        <Field label="Descripción larga" hint="Aparece en la página del producto. Más detalle = mejor SEO.">
          <textarea
            rows={5} value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describí el producto: materiales, usos, ventajas..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-y"
          />
        </Field>
        <Field label="Meta descripción (Google)" hint="Snippet en resultados de búsqueda. 120-160 caracteres. Vacío = generado automáticamente.">
          <textarea
            rows={2} maxLength={160} value={form.metaDescription}
            onChange={(e) => set('metaDescription', e.target.value)}
            placeholder="Ej: Etiquetas Brother DK-1201 compatibles en Bolivia. 400 unidades/rollo. Envío a todo el país."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{form.metaDescription.length}/160</p>
        </Field>
        <ArrayField
          label="Características / ventajas"
          hint="Cada ítem aparece como punto destacado en la página del producto."
          values={form.features}
          onChange={(v) => set('features', v)}
        />
        <ArrayField
          label="Impresoras compatibles"
          hint="Modelos con los que funciona esta etiqueta."
          values={form.compatibleWith}
          onChange={(v) => set('compatibleWith', v)}
        />
      </div>
    ),

    images: (
      <ImageManager productId={product.id} initialImages={product.images} />
    ),
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-8 items-start">

        {/* ── Columna izquierda: tabs ── */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === t.id
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {tabContent[tab]}
          </div>
        </div>

        {/* ── Columna derecha: precio y estado (sticky) ── */}
        <div className="w-72 flex-shrink-0 sticky top-6 flex flex-col gap-4">

          {/* Precio BOB */}
          <div className="bg-white rounded-2xl border-2 border-[var(--color-accent)] p-5 flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-900">
              Precio BOB <span className="text-[var(--color-accent)] font-normal text-xs">(campo principal)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-500">Bs.</span>
              <input
                type="number" step="0.01" min="0" placeholder="0.00"
                value={form.priceBob}
                onChange={(e) => set('priceBob', e.target.value)}
                className="flex-1 border border-orange-300 rounded-lg px-3 py-2.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            <p className="text-xs text-gray-400">Vacío → "Consultar precio" en la tienda.</p>
          </div>

          {/* Resto de campos de precio/estado */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <Field label="Precio referencia USD">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.priceUsd}
                  onChange={(e) => set('priceUsd', e.target.value)}
                  className={inputCls}
                />
              </div>
            </Field>
            <Field label="Stock" hint="Vacío = sin control de stock.">
              <input
                type="number" min="0" placeholder="ej. 50"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Orden de visualización">
              <input
                type="number" min="0"
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </Field>
            <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)]" />
                <span className="text-sm text-gray-700">Activo en la tienda</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={(e) => set('isFeatured', e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)]" />
                <span className="text-sm text-gray-700">Destacado en homepage</span>
              </label>
            </div>
          </div>

          {/* Guardar */}
          {error && <p className="text-red-500 text-sm px-1">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saved ? (
              <><CheckCircle size={18} /> ¡Guardado!</>
            ) : (
              <><Save size={18} /> {saving ? 'Guardando...' : 'Guardar cambios'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
