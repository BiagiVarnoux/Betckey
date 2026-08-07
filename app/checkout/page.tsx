'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart, CheckCircle, AlertCircle, Tag, X,
  Truck, Store, ChevronDown, ChevronUp, Loader2, MapPin,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBob } from '@/lib/utils';
import type { PickupPoint } from '@/lib/db/schema';
import type { MapLocation } from '@/components/checkout/MapPicker';

const MapPicker = lazy(() => import('@/components/checkout/MapPicker'));

type DeliveryType = 'envio' | 'recojo';
type Status = 'idle' | 'loading' | 'success' | 'error';

const DEPARTAMENTOS = [
  'Santa Cruz', 'La Paz', 'Cochabamba', 'Oruro', 'Potosí',
  'Sucre', 'Tarija', 'Trinidad', 'Cobija',
];

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-colors bg-white';
const labelCls = 'text-sm font-medium text-gray-700';

function SectionCard({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 font-semibold text-gray-900 text-sm ${onToggle ? 'hover:bg-gray-50 transition-colors' : 'cursor-default'}`}
      >
        {title}
        {onToggle && (open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />)}
      </button>
      {open && <div className="px-5 pb-5 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart();

  // ─── Estado del formulario ─────────────────────────────────────────────────
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('envio');
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: '', emailConfirm: '',
    phone: '',
    departamento: 'Santa Cruz',
    reference: '',
    billingName: '', billingCI: '',
  });
  const [allPickupPoints, setAllPickupPoints] = useState<PickupPoint[]>([]);
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  // ─── Secciones abiertas/cerradas ──────────────────────────────────────────
  const [openContact, setOpenContact] = useState(true);
  const [openAddress, setOpenAddress] = useState(true);
  const [openBilling, setOpenBilling] = useState(true);

  // ─── Cupón ────────────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'applied' | 'error'>('idle');
  const [couponMsg, setCouponMsg] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discountType: string; discountValue: number; discountAmount: number;
  } | null>(null);

  // ─── Estado envío ─────────────────────────────────────────────────────────
  const [status, setStatus] = useState<Status>('idle');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');

  // ─── Cargar puntos de recojo desde DB ─────────────────────────────────────
  useEffect(() => {
    fetch('/api/puntos-recojo')
      .then(r => r.ok ? r.json() : [])
      .then(setAllPickupPoints)
      .catch(() => {});
  }, []);

  // ─── Pre-rellenar con perfil del usuario ──────────────────────────────────
  useEffect(() => {
    fetch('/api/cuenta/perfil', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((p) => {
        if (!p) return;
        setForm((prev) => ({
          ...prev,
          firstName:   prev.firstName   || p.name     || '',
          lastName:    prev.lastName    || p.lastName  || '',
          phone:       prev.phone       || p.phone     || '',
          departamento: prev.departamento || p.city   || 'Santa Cruz',
        }));
      })
      .catch(() => {});
  }, []);

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  // ─── Cupón ────────────────────────────────────────────────────────────────
  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponStatus('loading'); setCouponMsg('');
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponInput.trim(), subtotal: total }),
    });
    const data = await res.json();
    if (res.ok) {
      setAppliedCoupon(data);
      setCouponStatus('applied');
      setCouponMsg(`¡Cupón aplicado! Descuento: −${formatBob(data.discountAmount)}`);
    } else {
      setCouponStatus('error');
      setCouponMsg(data.error ?? 'Cupón no válido');
      setAppliedCoupon(null);
    }
  }
  function removeCoupon() {
    setAppliedCoupon(null); setCouponInput(''); setCouponStatus('idle'); setCouponMsg('');
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');

    if (form.email && form.email !== form.emailConfirm) {
      setEmailError('Los correos no coinciden.');
      return;
    }
    if (deliveryType === 'envio' && !mapLocation && !form.reference) {
      setErrorMsg('Por favor indicá tu dirección de entrega en el mapa o en el campo de referencia.');
      setStatus('error');
      return;
    }
    if (deliveryType === 'recojo' && !selectedPickup) {
      setErrorMsg('Por favor seleccioná un punto de recojo.');
      setStatus('error');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Debés aceptar los Términos y Condiciones para continuar.');
      setStatus('error');
      return;
    }

    setStatus('loading'); setErrorMsg('');

    const pickupPoint = allPickupPoints.find((p) => String(p.id) === selectedPickup);
    const customerName = [form.firstName, form.lastName].filter(Boolean).join(' ') || form.firstName;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail: form.email || undefined,
          customerWhatsapp: form.phone,
          customerCity: form.departamento,
          deliveryType,
          customerAddress: deliveryType === 'envio' ? (mapLocation?.address ?? form.reference) : pickupPoint?.address,
          customerLat: mapLocation?.lat?.toString(),
          customerLng: mapLocation?.lng?.toString(),
          pickupPoint: deliveryType === 'recojo' ? pickupPoint?.name : undefined,
          billingName: form.billingName || undefined,
          billingCI:   form.billingCI   || undefined,
          items,
          couponCode: appliedCoupon?.code,
        }),
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

  // ─── Estados especiales ────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido recibido!</h1>
        <p className="text-gray-500 mb-1">Tu número de pedido es:</p>
        <p className="text-xl font-bold text-[var(--color-primary)] mb-6">{orderNumber}</p>
        <p className="text-sm text-gray-600 mb-8">
          Nos pondremos en contacto contigo por WhatsApp para coordinar el pago y la entrega.
        </p>
        <Link href="/" className="inline-block bg-[var(--color-primary)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
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
        <Link href="/catalogo" className="text-[var(--color-primary)] font-medium hover:underline">Ver catálogo →</Link>
      </div>
    );
  }

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = total - discountAmount;
  const pickupPointsForCity = allPickupPoints.filter((p) => p.city === form.departamento);
  const displayedPickupPoints = pickupPointsForCity.length ? pickupPointsForCity : allPickupPoints;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Columna izquierda ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-4">

          {/* Forma de entrega */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
            <p className="font-semibold text-gray-900 text-sm">Forma de entrega</p>
            <div className="flex flex-col gap-2">
              {([
                { id: 'envio', label: 'Envío estándar', sub: 'Llega en 1 a 2 días hábiles', icon: <Truck size={18} /> },
                { id: 'recojo', label: 'Recojo en punto', sub: 'En nuestros puntos de recojo', icon: <Store size={18} /> },
              ] as const).map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    deliveryType === opt.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio" name="deliveryType" value={opt.id}
                    checked={deliveryType === opt.id}
                    onChange={() => setDeliveryType(opt.id)}
                    className="sr-only"
                  />
                  <span className={deliveryType === opt.id ? 'text-[var(--color-primary)]' : 'text-gray-400'}>{opt.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.sub}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    deliveryType === opt.id ? 'border-[var(--color-primary)]' : 'border-gray-300'
                  }`}>
                    {deliveryType === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Información de contacto */}
          <SectionCard title="Información de contacto" open={openContact} onToggle={() => setOpenContact(!openContact)}>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Nombre</label>
                <input type="text" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)}
                  placeholder="Tu nombre" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Apellido</label>
                <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)}
                  placeholder="Tu apellido" className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Correo electrónico <span className="text-gray-400 font-normal text-xs">(opcional)</span></label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="tu@correo.com" className={inputCls} />
            </div>

            {form.email && (
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Confirmar correo electrónico</label>
                <input type="email" value={form.emailConfirm} onChange={(e) => { set('emailConfirm', e.target.value); setEmailError(''); }}
                  placeholder="tu@correo.com" className={inputCls + (emailError ? ' border-red-400' : '')} />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className={labelCls}>
                Teléfono / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-gray-50 text-sm text-gray-600 shrink-0 select-none">
                  🇧🇴 +591
                </div>
                <input type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  placeholder="7XXXXXXX" className={inputCls} />
              </div>
            </div>
          </SectionCard>

          {/* Dirección de entrega (envío) */}
          {deliveryType === 'envio' && (
            <SectionCard title="Dirección de entrega" open={openAddress} onToggle={() => setOpenAddress(!openAddress)}>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Departamento</label>
                <select value={form.departamento} onChange={(e) => { set('departamento', e.target.value); setMapLocation(null); }}
                  className={inputCls}>
                  {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Seleccioná un punto en el mapa</label>
                <Suspense fallback={
                  <div className="rounded-xl border border-gray-200 bg-gray-50 h-60 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                }>
                  <MapPicker value={mapLocation} onChange={setMapLocation} city={form.departamento} />
                </Suspense>
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Dirección</label>
                <input type="text" value={mapLocation?.address ?? ''} readOnly
                  placeholder="Hacé clic en el mapa para autocompletar"
                  className={inputCls + ' bg-gray-50 text-gray-600'} />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Referencia</label>
                <input type="text" value={form.reference} onChange={(e) => set('reference', e.target.value)}
                  placeholder="Ej: barda blanca, frente al parque..." className={inputCls} />
              </div>
            </SectionCard>
          )}

          {/* Puntos de recojo */}
          {deliveryType === 'recojo' && (
            <SectionCard title="Seleccioná un punto de recojo" open={openAddress} onToggle={() => setOpenAddress(!openAddress)}>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Ciudad</label>
                <select value={form.departamento} onChange={(e) => { set('departamento', e.target.value); setSelectedPickup(''); }}
                  className={inputCls}>
                  {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                {displayedPickupPoints.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No hay puntos de recojo disponibles todavía.</p>
                ) : (
                  displayedPickupPoints.map((p) => (
                    <label key={p.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedPickup === String(p.id) ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="pickup" value={String(p.id)} checked={selectedPickup === String(p.id)}
                        onChange={() => setSelectedPickup(String(p.id))} className="mt-1" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {p.address}
                        </p>
                        <p className="text-xs text-[var(--color-primary)] mt-0.5">{p.schedule}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </SectionCard>
          )}

          {/* Datos de facturación */}
          <SectionCard title="Datos de facturación" open={openBilling} onToggle={() => setOpenBilling(!openBilling)}>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>
                Nombre completo / Razón social <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <input type="text" value={form.billingName} onChange={(e) => set('billingName', e.target.value)}
                placeholder="Nombre completo o razón social" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>
                Carnet de Identidad / NIT <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <input type="text" value={form.billingCI} onChange={(e) => set('billingCI', e.target.value)}
                placeholder="Tu CI o NIT" className={inputCls} />
            </div>
          </SectionCard>

          {/* Cupón */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Tag size={15} className="text-[var(--color-primary)]" /> ¿Tienes un cupón?
            </p>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-green-800 font-mono">{appliedCoupon.code}</p>
                  <p className="text-xs text-green-700 mt-0.5">{couponMsg}</p>
                </div>
                <button type="button" onClick={removeCoupon} className="text-green-600 hover:text-green-800 p-1"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponStatus('idle'); setCouponMsg(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                  placeholder="Ingresá tu código"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono uppercase outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button type="button" onClick={applyCoupon} disabled={couponStatus === 'loading' || !couponInput.trim()}
                  className="px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {couponStatus === 'loading' ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponStatus === 'error' && (
              <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={13} /> {couponMsg}</p>
            )}
          </div>

          {/* Términos */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--color-primary)]" />
              <span className="text-sm text-gray-600">
                Estoy de acuerdo con los{' '}
                <Link href="/terminos" className="text-[var(--color-primary)] underline hover:no-underline">Términos y Condiciones</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptMarketing} onChange={(e) => setAcceptMarketing(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--color-primary)]" />
              <span className="text-sm text-gray-600">
                Acepto recibir información de productos y novedades de Betckey
              </span>
            </label>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} />{errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-opacity hover:opacity-90 text-base flex items-center justify-center gap-2"
          >
            {status === 'loading' ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : 'Realizar pedido'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Al confirmar nos contactaremos contigo por WhatsApp para coordinar el pago y la entrega.
          </p>
        </form>

        {/* ── Resumen del pedido ── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 text-sm">
              Resumen ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
            </h2>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.model}</p>
                  </div>
                  {item.priceBob && (
                    <span className="text-sm font-semibold text-gray-800 shrink-0">
                      {formatBob(parseFloat(item.priceBob) * item.quantity)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatBob(total)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1"><Tag size={12} /> Cupón {appliedCoupon.code}</span>
                  <span>−{formatBob(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className="text-xs italic text-gray-400">A coordinar por WhatsApp</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[var(--color-accent)]">{formatBob(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
