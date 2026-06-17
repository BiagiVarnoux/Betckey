export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import CuponesClient from './CuponesClient';

export default async function CuponesPage() {
  const db = getDb();
  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones de descuento</h1>
          <p className="text-sm text-gray-500">Crea y gestiona códigos de descuento para tus clientes</p>
        </div>
      </div>

      <CuponesClient initial={all} />
    </div>
  );
}
