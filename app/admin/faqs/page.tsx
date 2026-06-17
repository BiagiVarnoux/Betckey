export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import FaqsClient from './FaqsClient';

export default async function FaqsPage() {
  const db = getDb();
  const all = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preguntas frecuentes</h1>
          <p className="text-sm text-gray-500">Se muestran en la página de cada producto</p>
        </div>
      </div>
      <FaqsClient initial={all} />
    </div>
  );
}
