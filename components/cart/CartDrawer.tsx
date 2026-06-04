'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatBob } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart();

  // Bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={closeCart} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-semibold text-gray-900">Tu carrito</h2>
            {itemCount > 0 && (
              <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
              <ShoppingCart size={48} className="text-gray-200" />
              <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Ver catálogo →
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex gap-3 items-start">
                {/* Imagen */}
                <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.model}</p>

                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                        aria-label="Quitar uno"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-2 text-sm font-medium min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                        aria-label="Agregar uno"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.priceBob && (
                        <span className="text-sm font-semibold text-[var(--color-accent)]">
                          {formatBob(parseFloat(item.priceBob) * item.quantity)}
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
              <span className="text-base font-bold text-gray-900">{formatBob(total)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Los gastos de envío se coordinan por WhatsApp</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,#1a3a6b)] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Ir al checkout →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
