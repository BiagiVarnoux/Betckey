import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { announcementMessages } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

function isAuthorized(session: { value: string } | undefined) {
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const rows = await db
    .select()
    .from(announcementMessages)
    .orderBy(asc(announcementMessages.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isAuthorized(cookieStore.get('admin_session'))) {
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
