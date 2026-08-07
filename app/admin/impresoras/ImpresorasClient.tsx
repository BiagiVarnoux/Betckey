'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Check, X, Pencil } from 'lucide-react';
import { BRANDS, type Printer } from '@/lib/db/schema';

const inputCls =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

export default function ImpresorasClient({ initial }: { initial: Printer[] }) {
  const [rows, setRows] = useState<Printer[]>(initial);
  const [brand, setBrand] = useState<string>(BRANDS[0]);
  const [newModel, setNewModel] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editModel, setEditModel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ofBrand = rows.filter(r => r.brand === brand);

  async function add() {
    if (!newModel.trim()) return;
    setBusy(true); setError('');
    const res = await fetch('/api/admin/impresoras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, model: newModel.trim(), sortOrder: ofBrand.length }),
    });
    if (res.ok) {
      const created = await res.json();
      setRows(p => [...p, created]);
      setNewModel('');
    } else {
      setError((await res.json()).error ?? 'Error al crear.');
    }
    setBusy(false);
  }

  async function patch(id: number, body: Record<string, unknown>) {
    setError('');
    const res = await fetch(`/api/admin/impresoras/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const row = await res.json();
      setRows(p => p.map(x => x.id === id ? row : x));
      return true;
    }
    setError((await res.json()).error ?? 'Error al guardar.');
    return false;
  }

  async function remove(p: Printer) {
    if (!confirm(`¿Eliminar "${p.model}"?\n\nSe quitará de todos los productos que la tengan marcada como compatible.`)) return;
    const res = await fetch(`/api/admin/impresoras/${p.id}`, { method: 'DELETE' });
    if (res.ok) setRows(prev => prev.filter(x => x.id !== p.id));
    else setError('Error al eliminar.');
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {/* Marcas */}
      <div className="flex flex-wrap gap-2">
        {BRANDS.map(b => {
          const count = rows.filter(r => r.brand === b).length;
          return (
            <button
              key={b}
              onClick={() => { setBrand(b); setEditingId(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                brand === b
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary)]'
              }`}
            >
              {b} <span className={brand === b ? 'text-white/60' : 'text-gray-400'}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Alta */}
      <div className="flex gap-2">
        <input
          type="text" value={newModel}
          onChange={e => setNewModel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void add(); } }}
          placeholder={`Modelo de impresora ${brand} — ej: QL-800`}
          className={`${inputCls} flex-1`}
        />
        <button
          onClick={add} disabled={busy || !newModel.trim()}
          className="flex items-center gap-1.5 text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      {/* Lista */}
      {ofBrand.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
          Todavía no hay impresoras {brand} cargadas.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {ofBrand.map(p => (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-2.5 bg-white ${!p.isActive ? 'opacity-50' : ''}`}>
              {editingId === p.id ? (
                <>
                  <input
                    type="text" value={editModel} autoFocus
                    onChange={e => setEditModel(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') { if (await patch(p.id, { model: editModel.trim() })) setEditingId(null); }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    onClick={async () => { if (await patch(p.id, { model: editModel.trim() })) setEditingId(null); }}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-800">{p.model}</span>
                  {!p.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Oculta</span>
                  )}
                  <button
                    onClick={() => patch(p.id, { isActive: !p.isActive })}
                    title={p.isActive ? 'Ocultar del buscador' : 'Mostrar en el buscador'}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {p.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => { setEditingId(p.id); setEditModel(p.model); }}
                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(p)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Estas impresoras son las que podés marcar como compatibles en cada producto, y las que aparecen
        en el buscador de la página principal. El ojo la oculta sin borrarla.
      </p>
    </div>
  );
}
