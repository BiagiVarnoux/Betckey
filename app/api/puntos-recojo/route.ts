import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { pickupPoints } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  const db = getDb();
  const rows = await db.select().from(pickupPoints)
    .where(eq(pickupPoints.isActive, true))
    .orderBy(asc(pickupPoints.sortOrder));
  return NextResponse.json(rows);
}
