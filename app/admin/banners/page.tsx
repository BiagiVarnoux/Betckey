export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import BannersClient from './BannersClient';

export default async function BannersPage() {
  const db = getDb();
  const slides = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners del slider</h1>
          <p className="text-sm text-gray-500">Gestiona los banners del hero de la página de inicio</p>
        </div>
      </div>

      <BannersClient initial={slides} />
    </div>
  );
}
