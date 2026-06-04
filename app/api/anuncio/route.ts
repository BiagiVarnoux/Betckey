import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/session';
import { db } from '@/lib/db';
import { announcementMessages } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

async function requireAdmin() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function GET() {
  const rows = await db
    .select()
    .from(announcementMessages)
    .orderBy(asc(announcementMessages.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { text, isActive, sortOrder } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: 'El texto es requerido' }, { status: 400 });
  }

  const [created] = await db
    .insert(announcementMessages)
    .values({ text: text.trim(), isActive: isActive ?? true, sortOrder: sortOrder ?? 0 })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
