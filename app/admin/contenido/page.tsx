export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft, Images, Megaphone } from 'lucide-react';
import { getDb } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import BannersClient from '@/app/admin/banners/BannersClient';
import AnunciosClient from './AnunciosClient';

export default async function ContenidoPage() {
  const db = getDb();
  const slides = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contenido del sitio</h1>
          <p className="text-sm text-gray-500">Banners del slider y mensajes de la barra superior</p>
        </div>
      </div>

      {/* Banners */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Images size={18} className="text-[var(--color-primary)]" />
          <h2 className="font-semibold text-gray-900">Banners del slider</h2>
          <span className="text-xs text-gray-400 ml-auto">Aparecen en el hero de la página de inicio</span>
        </div>
        <BannersClient initial={slides} />
      </section>

      {/* Anuncios */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Megaphone size={18} className="text-[var(--color-primary)]" />
          <h2 className="font-semibold text-gray-900">Barra de anuncios</h2>
          <span className="text-xs text-gray-400 ml-auto">Rotan en la franja superior del sitio</span>
        </div>
        <AnunciosClient />
      </section>
    </div>
  );
}
