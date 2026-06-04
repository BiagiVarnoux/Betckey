'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, MessageCircle, Trash2, ChevronDown } from 'lucide-react';
import { formatBob } from '@/lib/utils';
import type { Order, OrderItem } from '@/lib/db/schema';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Recibido',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: 'Confirmado',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'paid',      label: 'Pagado',      color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: 'shipped',   label: 'Enviado',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'delivered', label: 'Entregado',   color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'cancelled', label: 'Cancelado',   color: 'bg-gray-100 text-gray-500 border-gray-200' },
] as const;

type StatusValue = typeof STATUS_OPTIONS[number]['value'];

function getStatus(value: string) {
  return STATUS_OPTIONS.find(s => s.value === value) ?? STATUS_OPTIONS[0];
}

function StatusSelect({ orderId, current, onUpdated }: { orderId: number; current: string; onUpdated: () => void }) {
  const [value, setValue] = useState(current);
  const [loading, setLoading] = useState(false);
  const status = getStatus(value);

  async function handleChange(newStatus: StatusValue) {
    setLoading(true);
    setValue(newStatus);
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    onUpdated();
  }

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={e => handleChange(e.target.value as StatusValue)}
        disabled={loading}
        className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer disabled:opacity-60 ${status.color}`}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  );
}

function DeleteButton({ orderId, orderNumber, onDeleted }: { orderId: number; orderNumber: string; onDeleted: () => void }) {
  const [step, setStep] = useState<'idle' | 'confirm'>('idle');
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    setLoading(false);
    onDeleted();
  }

  if (step === 'confirm') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600 font-medium">¿Eliminar {orderNumber}?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold bg-red-600 text-white px-2.5 py-1 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {loading ? '...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setStep('idle')}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
      title="Eliminar pedido"
    >
      <Trash2 size={16} />
    </button>
  );
}

export default function AdminPedidosPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders/list');
    if (res.ok) {
      const data = await res.json();
      setAllOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter);
  const countByStatus = (s: string) => allOrders.filter(o => o.status === s).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allOrders.length} pedido{allOrders.length !== 1 ? 's' : ''} en total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
        >
          Todos ({allOrders.length})
        </button>
        {STATUS_OPTIONS.map(opt => {
          const count = countByStatus(opt.value);
          if (count === 0) return null;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${filter === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-current' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Cargando pedidos...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
          <p>{allOrders.length === 0 ? 'Todavía no hay pedidos' : 'No hay pedidos con este estado'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const items = order.items as OrderItem[];
            const waLink = `https://wa.me/${String(order.customerWhatsapp).replace(/\D/g, '')}`;
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('es-BO', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : '—';

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-800">{order.orderNumber}</span>
                    <StatusSelect
                      orderId={order.id}
                      current={order.status}
                      onUpdated={fetchOrders}
                    />
                    <span className="text-xs text-gray-400">{date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-[#25d366] hover:opacity-80 transition-opacity"
                    >
                      <MessageCircle size={16} />
                      {order.customerWhatsapp}
                    </a>
                    <DeleteButton
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      onDeleted={fetchOrders}
                    />
                  </div>
                </div>

                {/* Cliente */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Cliente</p>
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Ciudad</p>
                    <p className="font-medium text-gray-800">{order.customerCity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-[var(--color-accent)]">
                      {order.subtotal ? formatBob(order.subtotal) : '—'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-gray-700">
                      <span>
                        {item.name} <span className="text-gray-400">({item.model})</span>
                      </span>
                      <span className="font-medium">
                        x{item.quantity}{item.priceBob ? ` · ${formatBob(parseFloat(item.priceBob) * item.quantity)}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
