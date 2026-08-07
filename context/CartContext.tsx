'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  model: string;
  priceBob: string | null;
  imageUrl: string | null;
  stock: number | null;   // null = sin control de stock
  quantity: number;
};

/** Máximo que se puede pedir de un producto: su stock, o sin límite si no lo controla. */
function maxFor(item: { stock?: number | null }): number {
  return item.stock === null || item.stock === undefined ? Infinity : item.stock;
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  syncStock: () => Promise<void>;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('betckey-cart');
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* corrupt storage */ }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('betckey-cart', JSON.stringify(items));
  }, [items, hydrated]);

  // Referencia siempre actual, para leer los items sin recrear syncStock
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const max = maxFor(item);
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i => i.productId === item.productId
          // el stock del producto manda sobre el guardado en localStorage
          ? { ...i, stock: item.stock, quantity: Math.min(i.quantity + quantity, max) }
          : i);
      }
      return [...prev, { ...item, quantity: Math.min(quantity, max) }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setItems(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, maxFor(i)) } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  /** Refresca el stock guardado en localStorage y recorta cantidades que ya no alcanzan. */
  const syncStock = useCallback(async () => {
    const ids = itemsRef.current.map(i => i.productId).filter(Boolean);
    if (!ids.length) return;
    try {
      const res = await fetch(`/api/stock?ids=${ids.join(',')}`, { cache: 'no-store' });
      if (!res.ok) return;
      const rows: { id: number; stock: number | null }[] = await res.json();
      setItems(prev => prev.flatMap(item => {
        const row = rows.find(r => r.id === item.productId);
        if (!row) return [item];
        if (row.stock === 0) return [];  // se agotó: sale del carrito
        const stock = row.stock;
        return [{ ...item, stock, quantity: stock === null ? item.quantity : Math.min(item.quantity, stock) }];
      }));
    } catch { /* sin conexión: se valida igual en el servidor */ }
  }, []);

  const total = items.reduce((sum, item) => {
    const price = item.priceBob ? parseFloat(item.priceBob) : 0;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, syncStock,
      total, itemCount,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
