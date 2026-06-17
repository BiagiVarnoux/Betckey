'use client';

import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Pencil, X, Check, HelpCircle } from 'lucide-react';
import type { FAQ } from '@/lib/db/schema';

function FaqRow({
  faq, isFirst, isLast, onToggle, onDelete, onMove, onSave,
}: {
  faq: FAQ;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onSave: (data: { question: string; answer: string }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!q.trim() || !a.trim()) return;
    setSaving(true);
    await onSave({ question: q.trim(), answer: a.trim() });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setQ(faq.question);
    setA(faq.answer);
    setEditing(false);
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

  return (
    <div className={`bg-white border rounded-2xl p-4 ${faq.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pregunta *" className={inputCls} />
              <textarea value={a} onChange={e => setA(e.target.value)} placeholder="Respuesta *" rows={3} className={inputCls + ' resize-none'} />
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-900">{faq.question}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-1">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Guardar">
                  <Check size={15} />
                </button>
                <button onClick={handleCancel} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100" title="Cancelar">
                  <X size={15} />
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100" title="Editar">
                <Pencil size={15} />
              </button>
            )}
            <button onClick={onToggle} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100" title={faq.isActive ? 'Desactivar' : 'Activar'}>
              {faq.isActive ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} className="text-gray-400" />}
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Eliminar">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="flex gap-1 mt-auto">
            <button onClick={() => onMove('up')} disabled={isFirst} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronUp size={15} />
            </button>
            <button onClick={() => onMove('down')} disabled={isLast} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </div>
      <div className={`h-0.5 mt-3 rounded-full ${faq.isActive ? 'bg-[var(--color-primary)]/20' : 'bg-gray-100'}`} />
    </div>
  );
}

export default function FaqsClient({ initial }: { initial: FAQ[] }) {
  const [list, setList] = useState<FAQ[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) { setError('Completa la pregunta y la respuesta'); return; }
    setCreating(true); setError('');
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQ, answer: newA }),
    });
    if (res.ok) {
      const created = await res.json();
      setList(prev => [...prev, created]);
      setNewQ(''); setNewA(''); setShowForm(false);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Error al crear');
    }
    setCreating(false);
  }

  async function handleToggle(faq: FAQ) {
    const res = await fetch(`/api/admin/faqs/${faq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setList(prev => prev.map(f => f.id === updated.id ? updated : f));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    if (res.ok) setList(prev => prev.filter(f => f.id !== id));
  }

  async function handleMove(faq: FAQ, dir: 'up' | 'down') {
    const idx = list.findIndex(f => f.id === faq.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx], b = list[swapIdx];
    await Promise.all([
      fetch(`/api/admin/faqs/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/faqs/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    const updated = [...list];
    updated[idx] = { ...a, sortOrder: b.sortOrder ?? 0 };
    updated[swapIdx] = { ...b, sortOrder: a.sortOrder ?? 0 };
    updated.sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0));
    setList(updated);
  }

  async function handleSave(faq: FAQ, data: { question: string; answer: string }) {
    const res = await fetch(`/api/admin/faqs/${faq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setList(prev => prev.map(f => f.id === updated.id ? updated : f));
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
          Nueva pregunta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Nueva pregunta frecuente</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta <span className="text-red-500">*</span></label>
            <input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="¿Estas etiquetas son compatibles con mi impresora?" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta <span className="text-red-500">*</span></label>
            <textarea value={newA} onChange={e => setNewA(e.target.value)} placeholder="Escribe la respuesta aquí..." rows={4} className={inputCls + ' resize-none'} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
            <button type="submit" disabled={creating} className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {creating ? 'Creando...' : 'Crear pregunta'}
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay preguntas frecuentes. Crea la primera.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((faq, i) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              isFirst={i === 0}
              isLast={i === list.length - 1}
              onToggle={() => handleToggle(faq)}
              onDelete={() => handleDelete(faq.id)}
              onMove={dir => handleMove(faq, dir)}
              onSave={data => handleSave(faq, data)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
