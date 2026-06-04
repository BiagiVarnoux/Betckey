'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, MapPin, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBob } from '@/lib/utils';

type FormData = {
  customerName: string;
  customerWhatsapp: string;
  customerCity: string;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ customerName: '', customerWhatsapp: '', customerCity: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al procesar el pedido');
      }

      const data = await res.json();
      setOrderNumber(data.orderNumber);
      clearCart();
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido recibido!</h1>
        <p className="text-gray-500 mb-1">Tu número de pedido es:</p>
        <p className="text-xl font-bold text-[var(--color-primary)] mb-6">{orderNumber}</p>
        <p className="text-sm text-gray-600 mb-8">
          Nos pondremos en contacto contigo por WhatsApp para coordinar el pago y la entrega.
        </p>
        <Link
          href="/"
          className="inline-block bg-[var(--color-primary)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ShoppingCart size={56} className="mx-auto text-gray-200 mb-4" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h1>
        <Link href="/catalogo" className="text-[var(--color-primary)] font-medium hover:underline">
          Ver catálogo →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Tus datos de contacto</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="customerName">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={form.customerName}
                onChange={handleChange}
                placeholder="Ej: María González"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="customerWhatsapp">
                Número de WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                id="customerWhatsapp"
                name="customerWhatsapp"
                type="tel"
                required
                value={form.customerWhatsapp}
                onChange={handleChange}
                placeholder="Ej: 70000000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="customerCity">
                Ciudad / Departamento <span className="text-red-500">*</span>
              </label>
              <input
                id="customerCity"
                name="customerCity"
                type="text"
                required
                value={form.customerCity}
                onChange={handleChange}
                placeholder="Ej: Santa Cruz de la Sierra"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Aviso de entrega */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-2">
              <Truck size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                La dirección de entrega y los gastos de envío serán coordinados contigo por WhatsApp una vez confirmado el pedido.
              </p>
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,#1a3a6b)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            {status === 'loading' ? 'Procesando...' : 'Realizar pedido'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Al confirmar nos contactaremos contigo por WhatsApp para coordinar el pago y la entrega.
          </p>
        </form>

        {/* Resumen del pedido */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">
              Resumen ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
            </h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  {item.priceBob && (
                    <span className="text-sm font-semibold text-gray-800 shrink-0">
                      {formatBob(parseFloat(item.priceBob) * item.quantity)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatBob(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  Envío
                </span>
                <span className="text-xs italic">A coordinar por WhatsApp</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[var(--color-accent)]">{formatBob(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
