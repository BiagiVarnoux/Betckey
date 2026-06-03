'use client';

import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({ value, onChange, min = 1, max = 10 }: Props) {
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
      <span className="px-5 py-2 font-semibold text-center min-w-[50px]">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
