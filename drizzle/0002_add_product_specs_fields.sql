ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "material"      text NOT NULL DEFAULT 'Papel térmico recubierto';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "print_type"    text NOT NULL DEFAULT 'Térmica directa';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "label_color"   text NOT NULL DEFAULT 'Negro sobre blanco';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "adhesive_type" text NOT NULL DEFAULT 'Permanente (fuerte)';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "roll_core_mm"  text NOT NULL DEFAULT '12mm';
