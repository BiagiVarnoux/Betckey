import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function isAuthenticated() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

export async function GET() {
  const db = getDb();
  const all = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { question, answer } = await req.json();
  if (!question?.trim() || !answer?.trim()) return NextResponse.json({ error: 'Pregunta y respuesta requeridas' }, { status: 400 });

  const db = getDb();
  const all = await db.select({ sortOrder: faqs.sortOrder }).from(faqs).orderBy(asc(faqs.sortOrder));
  const nextOrder = all.length > 0 ? (all[all.length - 1].sortOrder ?? 0) + 1 : 0;

  const [created] = await db.insert(faqs).values({
    question: question.trim(),
    answer: answer.trim(),
    sortOrder: nextOrder,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}
