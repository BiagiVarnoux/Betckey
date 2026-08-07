export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { getDb } from '@/lib/db';
import { printers } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import ImpresorasClient from './ImpresorasClient';

export default async function ImpresorasPage() {
  const initial = await getDb().select().from(printers)
    .orderBy(asc(printers.brand), asc(printers.sortOrder), asc(printers.model));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Printer size={22} className="text-[var(--color-primary)]" />
            Impresoras
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            El listado que alimenta el buscador de compatibilidad
          </p>
        </div>
      </div>
      <ImpresorasClient initial={initial} />
    </div>
  );
}
