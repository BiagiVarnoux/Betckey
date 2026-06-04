ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" integer;
