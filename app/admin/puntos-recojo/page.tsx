export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft, Store } from 'lucide-react';
import { getDb } from '@/lib/db';
import { pickupPoints } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import PuntosClient from './PuntosClient';

export default async function PuntosRecojo() {
  const db = getDb();
  const initial = await db.select().from(pickupPoints).orderBy(asc(pickupPoints.sortOrder));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store size={22} className="text-[var(--color-primary)]" />
            Puntos de recojo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Los clientes eligen uno de estos lugares al hacer su pedido</p>
        </div>
      </div>
      <PuntosClient initial={initial} />
    </div>
  );
}
