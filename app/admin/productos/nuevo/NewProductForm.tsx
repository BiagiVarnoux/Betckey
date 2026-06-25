'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const inputCls =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

export default function NewProductForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    model: '',
    slug: '',
    mainUse: '',
    labelType: '',
    widthMm: '',
    heightMm: '',
    widthIn: '',
    heightIn: '',
    unitsPerRoll: '',
    priceBob: '',
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function autoSlug(name: string) {
    return name.toLowerCase()
      .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
      .replace(/[óò]/g, 'o').replace(/[úù]/g, 'u').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        model: form.model,
        slug: form.slug,
        mainUse: form.mainUse,
        labelType: form.labelType,
        widthMm: Number(form.widthMm),
        heightMm: Number(form.heightMm),
        widthIn: form.widthIn,
        heightIn: form.heightIn,
        unitsPerRoll: Number(form.unitsPerRoll),
        priceBob: form.priceBob !== '' ? form.priceBob : null,
        compatibleWith: [],
        features: [],
        specs: [],
      }),
    });

    if (res.ok) {
      const created = await res.json();
      router.push(`/admin/productos/${created.id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? 'Error al crear el producto. Verificá que el slug no esté repetido.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Completá los datos básicos — podés editar todo después.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre del producto">
            <input
              type="text" required value={form.name}
              onChange={(e) => { set('name', e.target.value); if (!form.slug) set('slug', autoSlug(e.target.value)); }}
              placeholder="Ej: Etiqueta Brother DK-1201"
              className={inputCls}
            />
          </Field>
          <Field label="Modelo" hint="Código Brother. Ej: DK-1201">
            <input
              type="text" required value={form.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder="DK-1201"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Slug (URL)" hint={`URL pública: /productos/${form.slug || '...'}`}>
          <input
            type="text" required value={form.slug}
            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="dk-1201-etiqueta-direcciones"
            className={inputCls}
          />
        </Field>

        <Field label="Tipo de etiqueta" hint="Ej: Continua, Pre-cortada, Redonda">
          <input
            type="text" required value={form.labelType}
            onChange={(e) => set('labelType', e.target.value)}
            placeholder="Pre-cortada"
            className={inputCls}
          />
        </Field>

        <Field label="Uso principal" hint="Frase corta. Ej: Etiquetas de dirección para envíos">
          <input
            type="text" required value={form.mainUse}
            onChange={(e) => set('mainUse', e.target.value)}
            placeholder="Etiquetas de dirección para envíos"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ancho (mm)">
            <input type="number" required min="1" value={form.widthMm}
              onChange={(e) => set('widthMm', e.target.value)}
              placeholder="62" className={inputCls} />
          </Field>
          <Field label="Alto (mm)">
            <input type="number" required min="1" value={form.heightMm}
              onChange={(e) => set('heightMm', e.target.value)}
              placeholder="100" className={inputCls} />
          </Field>
          <Field label='Ancho (in)" '>
            <input type="text" required value={form.widthIn}
              onChange={(e) => set('widthIn', e.target.value)}
              placeholder='2.4"' className={inputCls} />
          </Field>
          <Field label='Alto (in)"'>
            <input type="text" required value={form.heightIn}
              onChange={(e) => set('heightIn', e.target.value)}
              placeholder='3.9"' className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Etiquetas por rollo">
            <input type="number" required min="1" value={form.unitsPerRoll}
              onChange={(e) => set('unitsPerRoll', e.target.value)}
              placeholder="400" className={inputCls} />
          </Field>
          <Field label="Precio BOB" hint="Vacío → 'Consultar precio'">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Bs.</span>
              <input type="number" step="0.01" min="0" value={form.priceBob}
                onChange={(e) => set('priceBob', e.target.value)}
                placeholder="0.00"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
          </Field>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
        >
          <Save size={18} />
          {saving ? 'Creando...' : 'Crear producto'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Después de crear podrás añadir imágenes, descripción, especificaciones y más.
        </p>
      </form>
    </div>
  );
}
