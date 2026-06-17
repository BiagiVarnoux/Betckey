'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Save, CheckCircle, Upload, ImageIcon } from 'lucide-react';
import type { ContactInfo } from '@/lib/db/schema';

export default function ContactForm({ info }: { info: ContactInfo }) {
  const [form, setForm] = useState({
    whatsapp:      info.whatsapp,
    phone:         info.phone,
    email:         info.email,
    address:       info.address,
    city:          info.city,
    businessHours: info.businessHours,
  });
  const [bannerUrl, setBannerUrl] = useState(info.bannerImageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('imagen', file);
    const res = await fetch('/api/admin/contact/imagen', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setBannerUrl(data.bannerImageUrl ?? '');
    }
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/admin/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Error al guardar.');
    }
    setSaving(false);
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Datos de contacto</h2>
          <p className="text-sm text-gray-500 mt-1">
            Esta información aparece en la página de contacto y el footer del sitio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>WhatsApp (con código de país)</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="59171234567" className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">Ej: 59171234567 (sin + ni espacios)</p>
          </div>
          <div>
            <label className={labelCls}>Teléfono (opcional)</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="72345678" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ventas@tudominio.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ciudad</label>
            <input name="city" value={form.city} onChange={handleChange} placeholder="La Paz, Bolivia" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Dirección</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Av. Ejemplo N° 123, Zona Central" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Horario de atención</label>
            <input name="businessHours" value={form.businessHours} onChange={handleChange} placeholder="Lunes a Sábado, 9:00 – 20:00" className={inputCls} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Imagen del banner de /contacto */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Imagen del banner de contacto</h2>
          <p className="text-sm text-gray-500 mt-1">
            Aparece como fondo en el hero de la página <span className="font-mono">/contacto</span>. Recomendado: 1920×600px JPG/WebP.
          </p>
        </div>

        <div
          className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer group hover:border-[var(--color-primary)] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {bannerUrl ? (
            <Image src={bannerUrl} alt="Banner contacto" fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
              <ImageIcon size={32} className="mb-2" />
              <p className="text-sm">Haz clic para subir una imagen</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Upload size={20} className="text-white" />
            <span className="text-white text-sm font-medium">{uploading ? 'Subiendo...' : 'Cambiar imagen'}</span>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerUpload} disabled={uploading} />
        </div>

        {bannerUrl && (
          <p className="text-xs text-gray-400 truncate">URL: {bannerUrl}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saved ? (
          <><CheckCircle size={18} /> ¡Guardado!</>
        ) : (
          <><Save size={18} /> {saving ? 'Guardando...' : 'Guardar información de contacto'}</>
        )}
      </button>
    </form>
  );
}
