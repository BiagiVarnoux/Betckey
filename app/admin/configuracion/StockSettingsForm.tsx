'use client';

import { useState } from 'react';
import { Save, CheckCircle, PackageCheck, PackageMinus, AlertTriangle } from 'lucide-react';
import type { StockThresholds } from '@/lib/settings';

export default function StockSettingsForm({ settings }: { settings: StockThresholds }) {
  const [green,  setGreen]  = useState(settings.stockGreenThreshold);
  const [yellow, setYellow] = useState(settings.stockYellowThreshold);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockGreenThreshold: green, stockYellowThreshold: yellow }),
    });

    const data = await res.json();
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(data.error ?? 'Error al guardar.');
    }
    setSaving(false);
  }

  const inputCls = 'w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Stock thresholds */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Umbrales de stock</h2>
          <p className="text-sm text-gray-500 mt-1">
            Definí a partir de qué cantidad de unidades el indicador cambia de color en la página del producto.
          </p>
        </div>

        {/* Visual preview */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Así se verá</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <PackageCheck size={14} /> En stock
            </span>
            <span className="text-gray-400">cuando hay más de <strong className="text-gray-700">{green}</strong> unidades</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <PackageMinus size={14} /> Quedan X unidades
            </span>
            <span className="text-gray-400">entre <strong className="text-gray-700">{yellow + 1}</strong> y <strong className="text-gray-700">{green}</strong> unidades</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              <AlertTriangle size={14} /> ¡Últimas X unidades!
            </span>
            <span className="text-gray-400">entre <strong className="text-gray-700">1</strong> y <strong className="text-gray-700">{yellow}</strong> unidades</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Umbral verde → amarillo</p>
              <p className="text-xs text-gray-400">Por encima de este número se muestra "En stock"</p>
            </div>
            <input
              type="number" min={2} value={green}
              onChange={(e) => setGreen(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Umbral amarillo → rojo</p>
              <p className="text-xs text-gray-400">Por debajo o igual a este número se muestra urgencia alta</p>
            </div>
            <input
              type="number" min={1} value={yellow}
              onChange={(e) => setYellow(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        {yellow >= green && (
          <p className="text-sm text-red-500">
            ⚠️ El umbral amarillo debe ser menor que el umbral verde.
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={saving || yellow >= green}
        className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saved ? (
          <><CheckCircle size={18} /> ¡Guardado!</>
        ) : (
          <><Save size={18} /> {saving ? 'Guardando...' : 'Guardar configuración'}</>
        )}
      </button>
    </form>
  );
}
