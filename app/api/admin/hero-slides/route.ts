import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function isAuthenticated() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function GET() {
  const db = getDb();
  const slides = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const { headline, sub, ctaLabel, ctaHref, ctaType } = body;
  if (!headline?.trim()) return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });

  const db = getDb();
  const all = await db.select({ sortOrder: heroSlides.sortOrder }).from(heroSlides).orderBy(asc(heroSlides.sortOrder));
  const nextOrder = all.length > 0 ? (all[all.length - 1].sortOrder ?? 0) + 1 : 0;

  const [created] = await db.insert(heroSlides).values({
    headline: headline.trim(),
    sub: sub?.trim() ?? '',
    ctaLabel: ctaLabel?.trim() ?? 'Ver catálogo',
    ctaHref: ctaHref?.trim() ?? '/catalogo',
    ctaType: ctaType ?? 'primary',
    sortOrder: nextOrder,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
