import { pgTable, serial, text, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

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

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
