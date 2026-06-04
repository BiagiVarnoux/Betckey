'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductWithImages } from '@/lib/products';
import { Save, CheckCircle, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import ImageManager from '@/components/admin/ImageManager';

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 text-left font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-5 py-5 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

function ArrayField({ label, hint, values, onChange }: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  function update(i: number, val: string) {
    const next = [...values];
    next[i] = val;
    onChange(next);
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...values, '']);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <div className="flex flex-col gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={v}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline w-fit mt-1"
        >
          <Plus size={14} /> Agregar
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

export default function EditProductForm({ product }: { product: ProductWithImages }) {
  const router = useRouter();

  const [form, setForm] = useState({
    // Precios y visibilidad
    priceUsd:       product.priceUsd ?? '',
    priceBob:       product.priceBob ?? '',
    isActive:       product.isActive,
    isFeatured:     product.isFeatured,
    sortOrder:      product.sortOrder,
    stock:          product.stock ?? '',
    // Identificación
    name:           product.name,
    slug:           product.slug,
    model:          product.model,
    // Descripción y SEO
    description:    product.description ?? '',
    metaDescription: product.metaDescription ?? '',
    mainUse:        product.mainUse,
    // Especificaciones técnicas
    labelType:      product.labelType,
    widthMm:        product.widthMm,
    heightMm:       product.heightMm,
    widthIn:        product.widthIn,
    heightIn:       product.heightIn,
    unitsPerRoll:   product.unitsPerRoll,
    material:       product.material,
    printType:      product.printType,
    labelColor:     product.labelColor,
    adhesiveType:   product.adhesiveType,
    rollCoreMm:     product.rollCoreMm,
    // Arrays
    compatibleWith: product.compatibleWith,
    features:       product.features,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/productos/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        priceUsd:    form.priceUsd !== '' ? form.priceUsd : null,
        priceBob:    form.priceBob !== '' ? form.priceBob : null,
        stock:       form.stock !== '' ? Number(form.stock) : null,
        sortOrder:   Number(form.sortOrder),
        widthMm:     Number(form.widthMm),
        heightMm:    Number(form.heightMm),
        unitsPerRoll: Number(form.unitsPerRoll),
        description:     form.description || null,
        metaDescription: form.metaDescription || null,
        // limpiar entradas vacías de arrays
        compatibleWith: form.compatibleWith.filter(Boolean),
        features:       form.features.filter(Boolean),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── PRECIO Y DISPONIBILIDAD ── */}
      <Section title="Precio y disponibilidad">
        <div className="bg-orange-50 border-2 border-[var(--color-accent)] rounded-xl p-4">
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Precio en BOB <span className="text-[var(--color-accent)] font-normal">(campo principal)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-500">Bs.</span>
            <input
              type="number" step="0.01" min="0" placeholder="0.00"
              value={form.priceBob}
              onChange={(e) => set('priceBob', e.target.value)}
              className="flex-1 border border-orange-300 rounded-lg px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Dejá en blanco para mostrar "Consultar precio" en la tienda.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <Field label="Stock" hint="Dejá en blanco para no controlar stock.">
            <input
              type="number" min="0" placeholder="ej. 50"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Orden de visualización">
          <input
            type="number" min="0"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </Field>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
              className="w-4 h-4 accent-[var(--color-primary)]" />
            <span className="text-sm font-medium text-gray-700">Producto activo (visible en la tienda)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)}
              className="w-4 h-4 accent-[var(--color-primary)]" />
            <span className="text-sm font-medium text-gray-700">Destacado en homepage</span>
          </label>
        </div>
      </Section>

      {/* ── IDENTIFICACIÓN ── */}
      <Section title="Identificación">
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
        <Field label="Slug (URL)" hint={`URL: /productos/${form.slug}`}>
          <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className={inputCls} required />
        </Field>
      </Section>

      {/* ── DESCRIPCIÓN Y SEO ── */}
      <Section title="Descripción y SEO">
        <Field label="Uso principal" hint="Frase corta que describe para qué sirve. Se usa en la ficha del producto.">
          <input type="text" value={form.mainUse} onChange={(e) => set('mainUse', e.target.value)}
            className={inputCls} required />
        </Field>
        <Field label="Descripción larga" hint="Texto libre que aparece en la página del producto. Cuanto más detallado, mejor para SEO.">
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describí el producto en detalle: materiales, usos recomendados, ventajas sobre la competencia..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-y"
          />
        </Field>
        <Field
          label="Meta descripción (Google)"
          hint="Aparece como snippet en Google. Idealmente entre 120 y 160 caracteres. Si se deja vacío se genera automáticamente."
        >
          <textarea
            rows={2}
            maxLength={160}
            value={form.metaDescription}
            onChange={(e) => set('metaDescription', e.target.value)}
            placeholder="Ej: Etiquetas Brother DK-1201 compatibles en Bolivia. 400 etiquetas/rollo. Envío a todo el país."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.metaDescription.length}/160</p>
        </Field>

        <ArrayField
          label="Características / ventajas"
          hint="Cada ítem aparece como punto destacado en la página del producto."
          values={form.features}
          onChange={(v) => set('features', v)}
        />
      </Section>

      {/* ── ESPECIFICACIONES TÉCNICAS ── */}
      <Section title="Especificaciones técnicas">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ancho (mm)">
            <input type="number" min="0" value={form.widthMm} onChange={(e) => set('widthMm', Number(e.target.value))}
              className={inputCls} required />
          </Field>
          <Field label="Alto (mm)" hint="0 = etiqueta continua">
            <input type="number" min="0" value={form.heightMm} onChange={(e) => set('heightMm', Number(e.target.value))}
              className={inputCls} required />
          </Field>
          <Field label="Ancho (pulgadas)">
            <input type="text" value={form.widthIn} onChange={(e) => set('widthIn', e.target.value)}
              placeholder='ej. 1-1/7"' className={inputCls} required />
          </Field>
          <Field label="Alto (pulgadas)">
            <input type="text" value={form.heightIn} onChange={(e) => set('heightIn', e.target.value)}
              placeholder='ej. 3-1/2"' className={inputCls} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Unidades por rollo">
            <input type="number" min="1" value={form.unitsPerRoll} onChange={(e) => set('unitsPerRoll', Number(e.target.value))}
              className={inputCls} required />
          </Field>
          <Field label="Tipo de etiqueta">
            <select value={form.labelType} onChange={(e) => set('labelType', e.target.value)}
              className={inputCls}>
              <option value="die-cut">Troquelado (die-cut)</option>
              <option value="continuous">Continuo (continuous)</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de impresión">
            <input type="text" value={form.printType} onChange={(e) => set('printType', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Material">
            <input type="text" value={form.material} onChange={(e) => set('material', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Color">
            <input type="text" value={form.labelColor} onChange={(e) => set('labelColor', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Tipo de adhesivo">
            <input type="text" value={form.adhesiveType} onChange={(e) => set('adhesiveType', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Núcleo del rollo">
            <input type="text" value={form.rollCoreMm} onChange={(e) => set('rollCoreMm', e.target.value)}
              className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* ── COMPATIBILIDAD ── */}
      <Section title="Compatibilidad">
        <ArrayField
          label="Impresoras compatibles"
          hint="Modelos Brother con los que funciona esta etiqueta."
          values={form.compatibleWith}
          onChange={(v) => set('compatibleWith', v)}
        />
      </Section>

      {error && <p className="text-red-500 text-sm">{error}</p>}

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

      {/* Imágenes — manejo independiente del submit */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 font-semibold text-gray-800">Imágenes</div>
        <div className="px-5 py-5">
          <ImageManager productId={product.id} initialImages={product.images} />
        </div>
      </div>
    </form>
  );
}
