'use client';

import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({ value, onChange, min = 1, max }: Props) {
  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '') return;
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    const clamped = Math.max(min, max !== undefined ? Math.min(max, n) : n);
    onChange(clamped);
  }

  return (
    <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
        disabled={value <= min}
        aria-label="Reducir cantidad"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        className="px-2 py-2 font-semibold text-center min-w-[50px] w-[60px] border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Cantidad"
      />
      <button
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
        disabled={max !== undefined && value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
