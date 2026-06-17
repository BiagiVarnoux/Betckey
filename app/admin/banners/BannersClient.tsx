'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Plus, Trash2, ToggleLeft, ToggleRight, Upload, ImageIcon,
  ChevronUp, ChevronDown, Pencil, X, Check,
} from 'lucide-react';
import type { HeroSlide } from '@/lib/db/schema';

const emptyForm = {
  headline: '',
  sub: '',
  ctaLabel: 'Ver catálogo',
  ctaHref: '/catalogo',
  ctaType: 'primary' as 'primary' | 'whatsapp',
};

function SlideCard({
  slide,
  isFirst,
  isLast,
  onToggle,
  onDelete,
  onMove,
  onImageUpload,
  onSave,
}: {
  slide: HeroSlide;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onImageUpload: (file: File) => Promise<void>;
  onSave: (data: Partial<HeroSlide>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    headline: slide.headline,
    sub: slide.sub,
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref,
    ctaType: slide.ctaType as 'primary' | 'whatsapp',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onImageUpload(file);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setEditing(false);
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden ${slide.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      <div className="flex gap-4 p-4">

        {/* Miniatura */}
        <div
          className="relative w-36 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer group"
          onClick={() => fileRef.current?.click()}
        >
          {slide.imageUrl ? (
            <Image src={slide.imageUrl} alt={slide.headline} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
              <ImageIcon size={24} />
              <p className="text-xs mt-1">Sin imagen</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <span className="text-white text-xs">Subiendo...</span>
            ) : (
              <Upload size={20} className="text-white" />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <input value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} placeholder="Título principal *" className={inputCls} />
              <input value={form.sub} onChange={e => setForm(p => ({ ...p, sub: e.target.value }))} placeholder="Subtítulo" className={inputCls} />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.ctaLabel} onChange={e => setForm(p => ({ ...p, ctaLabel: e.target.value }))} placeholder="Texto del botón" className={inputCls} />
                <input value={form.ctaHref} onChange={e => setForm(p => ({ ...p, ctaHref: e.target.value }))} placeholder="Enlace (/catalogo)" className={inputCls} />
              </div>
              <select value={form.ctaType} onChange={e => setForm(p => ({ ...p, ctaType: e.target.value as 'primary' | 'whatsapp' }))} className={inputCls}>
                <option value="primary">Botón normal (azul)</option>
                <option value="whatsapp">Botón WhatsApp (verde)</option>
              </select>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-gray-900 line-clamp-1">{slide.headline}</p>
              {slide.sub && <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{slide.sub}</p>}
              <p className="text-xs text-gray-400 mt-1.5">
                Botón: <span className="font-medium text-gray-600">{slide.ctaLabel}</span>
                {' → '}<span className="font-mono">{slide.ctaHref}</span>
                {slide.ctaType === 'whatsapp' && <span className="ml-1 text-green-600">(WhatsApp)</span>}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-1">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Guardar">
                  <Check size={16} />
                </button>
                <button onClick={() => { setEditing(false); setForm({ headline: slide.headline, sub: slide.sub, ctaLabel: slide.ctaLabel, ctaHref: slide.ctaHref, ctaType: slide.ctaType as 'primary' | 'whatsapp' }); }} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors" title="Cancelar">
                  <X size={16} />
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors" title="Editar">
                <Pencil size={16} />
              </button>
            )}
            <button onClick={onToggle} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" title={slide.isActive ? 'Desactivar' : 'Activar'}>
              {slide.isActive
                ? <ToggleRight size={16} className="text-green-500" />
                : <ToggleLeft size={16} className="text-gray-400" />}
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex gap-1 mt-auto">
            <button onClick={() => onMove('up')} disabled={isFirst} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
              <ChevronUp size={16} />
            </button>
            <button onClick={() => onMove('down')} disabled={isLast} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de estado */}
      <div className={`h-1 ${slide.isActive ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
    </div>
  );
}

export default function BannersClient({ initial }: { initial: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.headline.trim()) { setError('El título es requerido'); return; }
    setCreating(true); setError('');
    const res = await fetch('/api/admin/hero-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setSlides(prev => [...prev, created]);
      setForm(emptyForm);
      setShowForm(false);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Error al crear');
    }
    setCreating(false);
  }

  async function handleToggle(slide: HeroSlide) {
    const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !slide.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSlides(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este banner? No se puede deshacer.')) return;
    const res = await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
    if (res.ok) setSlides(prev => prev.filter(s => s.id !== id));
  }

  async function handleMove(slide: HeroSlide, dir: 'up' | 'down') {
    const idx = slides.findIndex(s => s.id === slide.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= slides.length) return;

    const a = slides[idx];
    const b = slides[swapIdx];

    await Promise.all([
      fetch(`/api/admin/hero-slides/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/hero-slides/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);

    const newSlides = [...slides];
    newSlides[idx] = { ...a, sortOrder: b.sortOrder ?? 0 };
    newSlides[swapIdx] = { ...b, sortOrder: a.sortOrder ?? 0 };
    newSlides.sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0));
    setSlides(newSlides);
  }

  async function handleImageUpload(slide: HeroSlide, file: File) {
    const fd = new FormData();
    fd.append('imagen', file);
    const res = await fetch(`/api/admin/hero-slides/${slide.id}/imagen`, { method: 'POST', body: fd });
    if (res.ok) {
      const updated = await res.json();
      setSlides(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  }

  async function handleSave(slide: HeroSlide, data: Partial<HeroSlide>) {
    const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setSlides(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          <Plus size={16} />
          Nuevo banner
        </button>
      </div>

      {/* Formulario nuevo banner */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Crear banner</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título principal <span className="text-red-500">*</span></label>
              <input name="headline" value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} placeholder="Ej: Etiquetas de calidad premium para tu impresora Brother" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <input value={form.sub} onChange={e => setForm(p => ({ ...p, sub: e.target.value }))} placeholder="Ej: Sin residuo, resistentes al agua. Envío a todo Bolivia." className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón</label>
              <input value={form.ctaLabel} onChange={e => setForm(p => ({ ...p, ctaLabel: e.target.value }))} placeholder="Ver catálogo" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enlace del botón</label>
              <input value={form.ctaHref} onChange={e => setForm(p => ({ ...p, ctaHref: e.target.value }))} placeholder="/catalogo" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de botón</label>
              <select value={form.ctaType} onChange={e => setForm(p => ({ ...p, ctaType: e.target.value as 'primary' | 'whatsapp' }))} className={inputCls}>
                <option value="primary">Botón normal (azul)</option>
                <option value="whatsapp">Botón WhatsApp (verde)</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400">Podrás subir la imagen de fondo después de crear el banner.</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
            <button type="submit" disabled={creating} className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {creating ? 'Creando...' : 'Crear banner'}
            </button>
          </div>
        </form>
      )}

      {slides.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay banners. Crea el primero.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {slides.map((slide, i) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              isFirst={i === 0}
              isLast={i === slides.length - 1}
              onToggle={() => handleToggle(slide)}
              onDelete={() => handleDelete(slide.id)}
              onMove={dir => handleMove(slide, dir)}
              onImageUpload={file => handleImageUpload(slide, file)}
              onSave={data => handleSave(slide, data)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
