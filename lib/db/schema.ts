import { pgTable, serial, text, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id:             serial('id').primaryKey(),
  slug:           text('slug').notNull().unique(),
  name:           text('name').notNull(),
  model:          text('model').notNull(),
  labelType:      text('label_type').notNull(),
  mainUse:        text('main_use').notNull(),
  widthMm:        integer('width_mm').notNull(),
  heightMm:       integer('height_mm').notNull(),
  widthIn:        text('width_in').notNull(),
  heightIn:       text('height_in').notNull(),
  unitsPerRoll:   integer('units_per_roll').notNull(),
  priceUsd:       decimal('price_usd', { precision: 10, scale: 2 }),
  priceBob:       decimal('price_bob', { precision: 10, scale: 2 }),
  compatibleWith: text('compatible_with').array().notNull(),
  features:       text('features').array().notNull(),
  description:    text('description'),
  metaDescription: text('meta_description'),
  stock:          integer('stock'),
  material:       text('material').notNull().default('Papel térmico recubierto'),
  printType:      text('print_type').notNull().default('Térmica directa'),
  labelColor:     text('label_color').notNull().default('Negro sobre blanco'),
  adhesiveType:   text('adhesive_type').notNull().default('Permanente (fuerte)'),
  rollCoreMm:     text('roll_core_mm').notNull().default('12mm'),
  specs:          jsonb('specs').$type<{ label: string; value: string }[]>().notNull().default([]),
  imageUrl:       text('image_url'),
  isActive:       boolean('is_active').notNull().default(true),
  isFeatured:     boolean('is_featured').notNull().default(false),
  sortOrder:      integer('sort_order').notNull().default(0),
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
});

export const productImages = pgTable('product_images', {
  id:        serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url:       text('url').notNull(),
  alt:       text('alt').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const announcementMessages = pgTable('announcement_messages', {
  id:        serial('id').primaryKey(),
  text:      text('text').notNull(),
  isActive:  boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type AnnouncementMessage = typeof announcementMessages.$inferSelect;
