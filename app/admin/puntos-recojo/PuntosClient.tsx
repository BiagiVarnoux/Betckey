'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, MapPin, Clock } from 'lucide-react';
import type { PickupPoint } from '@/lib/db/schema';

const CIUDADES = [
  'Santa Cruz', 'La Paz', 'Cochabamba', 'Oruro', 'Potosí',
  'Sucre', 'Tarija', 'Trinidad', 'Cobija',
];

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

type FormState = { name: string; address: string; city: string; schedule: string };
const emptyForm: FormState = { name: '', address: '', city: 'Santa Cruz', schedule: '' };

function PuntoForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: FormState;
  onSave: (f: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial ?? emptyForm);
  function set(k: keyof FormState, v: string) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-xs font-medium text-gray-600">Nombre del punto</label>
          <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Ej: Punto Santa Cruz – Centro" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-xs font-medium text-gray-600">Dirección</label>
          <input type="text" required value={form.address} onChange={e => set('address', e.target.value)}
            placeholder="Ej: Calle Arenales 248, Santa Cruz" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Ciudad</label>
          <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls}>
            {CIUDADES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Horario de atención</label>
          <input type="text" value={form.schedule} onChange={e => set('schedule', e.target.value)}
            placeholder="Ej: Lun–Vie 9:00–18:00" className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg transition-colors">
          <X size={15} /> Cancelar
        </button>
        <button type="button" onClick={() => onSave(form)} disabled={saving || !form.name.trim() || !form.address.trim()}
          className="flex items-center gap-1.5 text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
          <Check size={15} /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

export default function PuntosClient({ initial }: { initial: PickupPoint[] }) {
  const [points, setPoints] = useState<PickupPoint[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(form: FormState) {
    setSaving(true); setError('');
    const res = await fetch('/api/admin/puntos-recojo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sortOrder: points.length }),
    });
    if (res.ok) {
      const row = await res.json();
      setPoints(p => [...p, row]);
      setAdding(false);
    } else {
      setError('Error al crear el punto.');
    }
    setSaving(false);
  }

  async function handleEdit(id: number, form: FormState) {
    setSaving(true); setError('');
    const res = await fetch(`/api/admin/puntos-recojo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const row = await res.json();
      setPoints(p => p.map(x => x.id === id ? row : x));
      setEditingId(null);
    } else {
      setError('Error al guardar.');
    }
    setSaving(false);
  }

  async function handleToggle(p: PickupPoint) {
    const res = await fetch(`/api/admin/puntos-recojo/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      const row = await res.json();
      setPoints(prev => prev.map(x => x.id === p.id ? row : x));
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    const res = await fetch(`/api/admin/puntos-recojo/${id}`, { method: 'DELETE' });
    if (res.ok) setPoints(p => p.filter(x => x.id !== id));
    else setError('Error al eliminar.');
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {points.length === 0 && !adding && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
          No hay puntos de recojo. Creá el primero con el botón de abajo.
        </div>
      )}

      {points.map(p => (
        <div key={p.id}>
          {editingId === p.id ? (
            <PuntoForm
              initial={{ name: p.name, address: p.address, city: p.city, schedule: p.schedule }}
              onSave={f => handleEdit(p.id, f)}
              onCancel={() => setEditingId(null)}
              saving={saving}
            />
          ) : (
            <div className={`bg-white border rounded-2xl px-5 py-4 flex items-start gap-4 transition-opacity ${!p.isActive ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p.city}</span>
                  {!p.isActive && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactivo</span>}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {p.address}
                </p>
                {p.schedule && (
                  <p className="text-xs text-[var(--color-primary)] flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> {p.schedule}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(p)} title={p.isActive ? 'Desactivar' : 'Activar'}
                  className="text-gray-400 hover:text-gray-700 transition-colors">
                  {p.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => setEditingId(p.id)}
                  className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(p.id, p.name)}
                  className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <PuntoForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-[var(--color-primary)] border border-[var(--color-primary)] px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors w-fit">
          <Plus size={16} /> Agregar punto de recojo
        </button>
      )}

      <p className="text-xs text-gray-400 mt-1">
        El ojo activa/desactiva sin eliminar. Los puntos inactivos no aparecen en el checkout.
      </p>
    </div>
  );
}
