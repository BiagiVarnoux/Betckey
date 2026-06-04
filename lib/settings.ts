import { db } from './db';
import { storeSettings } from './db/schema';
import { eq } from 'drizzle-orm';

export type StockThresholds = {
  stockGreenThreshold: number;
  stockYellowThreshold: number;
};

const DEFAULTS: StockThresholds = {
  stockGreenThreshold: 10,
  stockYellowThreshold: 3,
};

export async function getStoreSettings(): Promise<StockThresholds> {
  const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  if (!row) return DEFAULTS;
  return {
    stockGreenThreshold:  row.stockGreenThreshold,
    stockYellowThreshold: row.stockYellowThreshold,
  };
}

export async function upsertStoreSettings(data: StockThresholds): Promise<void> {
  await db
    .insert(storeSettings)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: storeSettings.id, set: data });
}
