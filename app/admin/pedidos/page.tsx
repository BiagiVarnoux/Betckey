export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import type { Order, OrderItem } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import { formatBob } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  shipped:   { label: 'Enviado',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  delivered: { label: 'Entregado',  color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelado',  color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export default async function AdminPedidosPage() {
  const db = getDb();
  const allOrders: Order[] = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

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

      {allOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
          <p>Todavía no hay pedidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allOrders.map(order => {
            const items = order.items as OrderItem[];
            const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
            const waLink = `https://wa.me/${String(order.customerWhatsapp).replace(/\D/g, '')}`;
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—';

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-gray-800">{order.orderNumber}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{date}</p>
                  </div>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-[#25d366] hover:opacity-80 transition-opacity"
                  >
                    <MessageCircle size={16} />
                    {order.customerWhatsapp}
                  </a>
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
                    <p className="font-bold text-[var(--color-accent)]">{order.subtotal ? formatBob(order.subtotal) : '—'}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-gray-700">
                      <span>{item.name} <span className="text-gray-400">({item.model})</span></span>
                      <span className="font-medium">x{item.quantity}{item.priceBob ? ` · ${formatBob(parseFloat(item.priceBob) * item.quantity)}` : ''}</span>
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
