'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import type { AnnouncementMessage } from '@/lib/db/schema';

type LocalMessage = AnnouncementMessage & { dirty?: boolean };

export default function AnunciosClient() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState('');
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/anuncio').then(r => r.json()).then(data => { setMessages(data); setLoading(false); });
  }, []);

  async function addMessage() {
    const res = await fetch('/api/anuncio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Nuevo mensaje', isActive: true, sortOrder: messages.length }),
    });
    if (!res.ok) { setError('Error al agregar'); return; }
    const created = await res.json();
    setMessages(prev => [...prev, created]);
  }

  async function saveMessage(msg: LocalMessage) {
    setSaving(msg.id); setError('');
    const res = await fetch(`/api/anuncio/${msg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg.text, isActive: msg.isActive, sortOrder: msg.sortOrder }),
    });
    if (!res.ok) setError('Error al guardar');
    else { const u = await res.json(); setMessages(prev => prev.map(m => m.id === msg.id ? u : m)); }
    setSaving(null);
  }

  async function deleteMessage(id: number) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    const res = await fetch(`/api/anuncio/${id}`, { method: 'DELETE' });
    if (!res.ok) { setError('Error al eliminar'); return; }
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  async function toggleActive(msg: LocalMessage) {
    const updated = { ...msg, isActive: !msg.isActive };
    setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
    await fetch(`/api/anuncio/${msg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: updated.isActive }),
    });
  }

  function onTextChange(id: number, text: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text, dirty: true } : m));
  }

  function onDragStart(index: number) { dragIndex.current = index; }
  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    setMessages(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next.map((m, i) => ({ ...m, sortOrder: i, dirty: true }));
    });
  }
  async function onDragEnd() {
    dragIndex.current = null;
    for (const m of messages.filter(m => m.dirty)) {
      await fetch(`/api/anuncio/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: m.sortOrder }),
      });
    }
    setMessages(prev => prev.map(m => ({ ...m, dirty: false })));
  }

  if (loading) return <div className="text-sm text-gray-400 py-4">Cargando...</div>;

  return (
    <div>
      {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {messages.filter(m => m.isActive).length > 0 && (
        <div className="mb-4 bg-[var(--color-primary)] text-white text-sm py-2 px-4 rounded-lg text-center">
          Vista previa: <span className="font-medium">{messages.filter(m => m.isActive)[0].text}</span>
          {messages.filter(m => m.isActive).length > 1 && (
            <span className="text-blue-200 ml-2">+{messages.filter(m => m.isActive).length - 1} más</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        {messages.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No hay mensajes.</p>}
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={e => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm ${msg.isActive ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}
          >
            <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />
            <input
              type="text"
              value={msg.text}
              onChange={e => onTextChange(msg.id, e.target.value)}
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none border-b border-transparent focus:border-gray-300 transition-colors py-0.5"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              {msg.dirty && (
                <button onClick={() => saveMessage(msg)} disabled={saving === msg.id}
                  className="flex items-center gap-1 text-xs bg-[var(--color-primary)] text-white px-2.5 py-1 rounded-lg hover:opacity-90 disabled:opacity-50">
                  <Save size={12} />{saving === msg.id ? 'Guardando...' : 'Guardar'}
                </button>
              )}
              <button onClick={() => toggleActive(msg)} className="text-gray-400 hover:text-gray-700" title={msg.isActive ? 'Desactivar' : 'Activar'}>
                {msg.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => deleteMessage(msg.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addMessage}
        className="flex items-center gap-2 text-sm text-[var(--color-primary)] border border-[var(--color-primary)] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
        <Plus size={16} /> Agregar mensaje
      </button>
      <p className="text-xs text-gray-400 mt-3">Arrastra para reordenar. El ojo activa/desactiva sin eliminar.</p>
    </div>
  );
}
