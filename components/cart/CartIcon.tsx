'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartIcon() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
      aria-label="Carrito"
    >
      <ShoppingCart size={22} />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full px-1">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
