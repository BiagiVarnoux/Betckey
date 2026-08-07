export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Printer } from 'lucide-react';
import { getCompatibilityData } from '@/lib/compatibility';
import CompatibilityFinder, { type SearchMode } from '@/components/compatibility/CompatibilityFinder';

export const metadata: Metadata = {
  title: 'Buscador de compatibilidad | BETCKEY Bolivia',
  description:
    'Encontrá la etiqueta compatible con tu impresora Brother, Dymo o Zebra. Buscá por modelo de impresora, por medidas o por código de etiqueta.',
};

const MODES = ['modelo', 'medidas', 'impresora'];

export default async function CompatibilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string; buscar?: string; impresora?: string; medida?: string; modelo?: string }>;
}) {
  const [data, params] = await Promise.all([getCompatibilityData(), searchParams]);

  const mode = MODES.includes(params.buscar ?? '') ? (params.buscar as SearchMode) : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-sm font-medium px-3 py-1 rounded-full mb-4">
          <Printer size={15} /> Buscador de compatibilidad
        </span>
        <h1 className="text-3xl font-bold text-gray-900">¿Qué etiqueta necesita tu impresora?</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Elegí la marca de tu impresora y buscá por modelo, por medidas o por el código de la etiqueta
          que venías usando.
        </p>
      </div>

      <CompatibilityFinder
        data={data}
        initial={{
          brand: params.marca,
          mode,
          printerId: params.impresora ? Number(params.impresora) : undefined,
          size: params.medida,
          model: params.modelo,
        }}
      />
    </div>
  );
}
