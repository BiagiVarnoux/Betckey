import { getDb } from '@/lib/db';
import { contactInfo } from '@/lib/db/schema';
import type { ContactInfo } from '@/lib/db/schema';

export async function getContactInfo(): Promise<ContactInfo> {
  const db = getDb();
  const rows = await db.select().from(contactInfo).limit(1);
  if (rows.length > 0) return rows[0];

  // Si no existe ningún registro, crear uno vacío
  const [created] = await db.insert(contactInfo).values({}).returning();
  return created;
}

export async function upsertContactInfo(data: Partial<Omit<ContactInfo, 'id' | 'updatedAt'>>): Promise<ContactInfo> {
  const db = getDb();
  const rows = await db.select().from(contactInfo).limit(1);

  if (rows.length > 0) {
    const [updated] = await db
      .update(contactInfo)
      .set({ ...data, updatedAt: new Date() })
      .returning();
    return updated;
  }

  const [created] = await db.insert(contactInfo).values(data).returning();
  return created;
}
