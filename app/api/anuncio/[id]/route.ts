import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { announcementMessages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function isAuthorized(session: { value: string } | undefined) {
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!isAuthorized(cookieStore.get('admin_session'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const update: Partial<{ text: string; isActive: boolean; sortOrder: number }> = {};
  if (body.text !== undefined) update.text = body.text.trim();
  if (body.isActive !== undefined) update.isActive = body.isActive;
  if (body.sortOrder !== undefined) update.sortOrder = body.sortOrder;

  const [updated] = await db
    .update(announcementMessages)
    .set(update)
    .where(eq(announcementMessages.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!isAuthorized(cookieStore.get('admin_session'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(announcementMessages).where(eq(announcementMessages.id, Number(id)));
  return NextResponse.json({ ok: true });
}
