'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShoppingBag, LogOut, Save, CheckCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';
import type { Order } from '@/lib/db/schema';

type UserProfile = {
  id: number;
  email: string;
  name: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
};

const inputCls =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pendiente',   cls: 'bg-amber-100 text-amber-700' },
  processing: { label: 'En proceso',  cls: 'bg-blue-100 text-blue-700' },
  shipped:    { label: 'Enviado',     cls: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Entregado',   cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelado',   cls: 'bg-red-100 text-red-700' },
};

function formatDate(d: Date | string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatBob(v: string | null) {
  if (!v) return '—';
  return `Bs. ${parseFloat(v).toFixed(2)}`;
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_LABEL[order.status] ?? { label: order.status, cls: 'bg-gray-100 text-gray-600' };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <Package size={18} className="text-[var(--color-primary)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">{order.orderNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-semibold text-sm text-gray-900">{formatBob(order.subtotal)}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>{st.label}</span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-2 font-medium">Producto</th>
                <th className="pb-2 font-medium text-center">Cant.</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 text-gray-700">{item.name} <span className="text-gray-400 text-xs">({item.model})</span></td>
                  <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-700">
                    {item.priceBob ? `Bs. ${(parseFloat(item.priceBob) * item.quantity).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {order.notes && (
            <p className="mt-3 text-xs text-gray-400 italic">{order.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CuentaClient({ user, orders: initialOrders }: { user: UserProfile; orders: Order[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'perfil' | 'pedidos'>('pedidos');
  const [form, setForm] = useState({
    name: user.name,
    lastName: user.lastName,
    address: user.address,
    city: user.city,
    phone: user.phone,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/cuenta/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Error al guardar. Intentá de nuevo.');
    }
    setSaving(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const displayName = [user.name, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
          <p className="text-sm text-gray-500 mt-0.5">{displayName} · {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {([
          { id: 'pedidos', label: 'Mis pedidos', icon: <ShoppingBag size={15} /> },
          { id: 'perfil',  label: 'Mis datos',   icon: <User size={15} /> },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.icon}{t.label}
            {t.id === 'pedidos' && initialOrders.length > 0 && (
              <span className="text-xs bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded-full">
                {initialOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Pedidos */}
      {tab === 'pedidos' && (
        <div className="flex flex-col gap-3">
          {initialOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600 mb-1">Todavía no tenés pedidos</p>
              <p className="text-sm">Cuando hagás un pedido mientras estás logueado, aparecerá aquí.</p>
            </div>
          ) : (
            initialOrders.map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </div>
      )}

      {/* Tab: Perfil */}
      {tab === 'perfil' && (
        <form onSubmit={handleSavePerfil} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Apellido</label>
              <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
            <input type="email" value={user.email} disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400">El correo no se puede cambiar.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Teléfono / WhatsApp</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="+591 7XXXXXXX" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Dirección de entrega</label>
            <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)}
              placeholder="Calle, número, zona..." className={inputCls} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Ciudad</label>
            <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
              placeholder="Santa Cruz, La Paz..." className={inputCls} />
          </div>

          <button
            type="submit" disabled={saving}
            className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saved ? (
              <><CheckCircle size={18} /> ¡Guardado!</>
            ) : (
              <><Save size={18} /> {saving ? 'Guardando...' : 'Guardar cambios'}</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
