CREATE TABLE IF NOT EXISTS "store_settings" (
  "id" serial PRIMARY KEY,
  "stock_green_threshold"  integer NOT NULL DEFAULT 10,
  "stock_yellow_threshold" integer NOT NULL DEFAULT 3
);
-- Insertar fila única de configuración si no existe
INSERT INTO "store_settings" ("id", "stock_green_threshold", "stock_yellow_threshold")
VALUES (1, 10, 3)
ON CONFLICT ("id") DO NOTHING;
