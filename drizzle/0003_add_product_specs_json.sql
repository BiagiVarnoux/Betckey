ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "specs" jsonb NOT NULL DEFAULT '[]'::jsonb;
