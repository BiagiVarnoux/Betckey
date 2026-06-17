'use client';

import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Copy, CheckCheck } from 'lucide-react';
import type { Coupon } from '@/lib/db/schema';

function StatusBadge({ coupon }: { coupon: Coupon }) {
  const now = new Date();
  const expired = coupon.expiresAt && now > new Date(coupon.expiresAt);
  const exhausted = coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit;

  if (!coupon.isActive) return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactivo</span>;
  if (expired) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Expirado</span>;
  if (exhausted) return <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Agotado</span>;
  return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>;
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="ml-1 text-gray-400 hover:text-gray-700 transition-colors" title="Copiar código">
      {copied ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

const emptyForm = {
  code: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: '',
  usageLimit: '',
  expiresAt: '',
};

export default function CuponesClient({ initial }: { initial: Coupon[] }) {
  const [list, setList] = useState<Coupon[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setList(prev => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Error al crear el cupón');
    }
    setSaving(false);
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setList(prev => prev.map(c => c.id === updated.id ? updated : c));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este cupón? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.ok) setList(prev => prev.filter(c => c.id !== id));
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

  return (
    <div className="flex flex-col gap-6">
      {/* Botón nuevo cupón */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          <Plus size={16} />
          Nuevo cupón
        </button>
      </div>

      {/* Formulario nuevo cupón */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Crear cupón</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input name="code" required value={form.code} onChange={handleChange} placeholder="VERANO20" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Se guardará en mayúsculas</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de descuento <span className="text-red-500">*</span></label>
              <select name="discountType" value={form.discountType} onChange={handleChange} className={inputCls}>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo (Bs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor <span className="text-red-500">*</span>
              </label>
              <input
                name="discountValue"
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={form.discountType === 'percentage' ? '10' : '20.00'}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.discountType === 'percentage' ? 'Ej: 10 = 10% de descuento' : 'Ej: 20 = Bs. 20 de descuento'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Límite de usos</label>
              <input name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={handleChange} placeholder="Dejar vacío = ilimitado" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
              <input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={handleChange} className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Dejar vacío = sin fecha límite</p>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              <Tag size={15} />
              {saving ? 'Creando...' : 'Crear cupón'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de cupones */}
      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay cupones creados todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map(coupon => (
            <div key={coupon.id} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-gray-900 text-base tracking-wider">{coupon.code}</span>
                  <CopyCode code={coupon.code} />
                  <StatusBadge coupon={coupon} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                  <span>
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% de descuento`
                      : `Bs. ${coupon.discountValue} de descuento`}
                  </span>
                  <span>
                    Usos: {coupon.usageCount}{coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ' (ilimitado)'}
                  </span>
                  {coupon.expiresAt && (
                    <span>Expira: {new Date(coupon.expiresAt).toLocaleDateString('es-BO')}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(coupon)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  title={coupon.isActive ? 'Desactivar' : 'Activar'}
                >
                  {coupon.isActive
                    ? <><ToggleRight size={16} className="text-green-500" /> Activo</>
                    : <><ToggleLeft size={16} className="text-gray-400" /> Inactivo</>}
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
