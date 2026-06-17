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

export const storeSettings = pgTable('store_settings', {
  id:                     serial('id').primaryKey(),
  stockGreenThreshold:    integer('stock_green_threshold').notNull().default(10),
  stockYellowThreshold:   integer('stock_yellow_threshold').notNull().default(3),
});

export const announcementMessages = pgTable('announcement_messages', {
  id:        serial('id').primaryKey(),
  text:      text('text').notNull(),
  isActive:  boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contactInfo = pgTable('contact_info', {
  id:              serial('id').primaryKey(),
  whatsapp:        text('whatsapp').notNull().default(''),
  phone:           text('phone').notNull().default(''),
  email:           text('email').notNull().default(''),
  address:         text('address').notNull().default(''),
  city:            text('city').notNull().default(''),
  businessHours:   text('business_hours').notNull().default(''),
  bannerImageUrl:  text('banner_image_url'),
  updatedAt:       timestamp('updated_at').defaultNow(),
});

export const faqs = pgTable('faqs', {
  id:        serial('id').primaryKey(),
  question:  text('question').notNull(),
  answer:    text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const heroSlides = pgTable('hero_slides', {
  id:        serial('id').primaryKey(),
  headline:  text('headline').notNull(),
  sub:       text('sub').notNull().default(''),
  ctaLabel:  text('cta_label').notNull().default('Ver catálogo'),
  ctaHref:   text('cta_href').notNull().default('/catalogo'),
  ctaType:   text('cta_type').notNull().default('primary'), // 'primary' | 'whatsapp'
  imageUrl:  text('image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id:            serial('id').primaryKey(),
  code:          text('code').notNull().unique(),
  discountType:  text('discount_type').notNull().default('percentage'), // 'percentage' | 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  usageLimit:    integer('usage_limit'),        // null = ilimitado
  usageCount:    integer('usage_count').notNull().default(0),
  expiresAt:     timestamp('expires_at'),       // null = sin fecha límite
  isActive:      boolean('is_active').notNull().default(true),
  createdAt:     timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id:               serial('id').primaryKey(),
  orderNumber:      text('order_number').notNull().unique(),
  customerName:     text('customer_name').notNull(),
  customerWhatsapp: text('customer_whatsapp').notNull(),
  customerCity:     text('customer_city').notNull(),
  items:            jsonb('items').$type<OrderItem[]>().notNull(),
  subtotal:         decimal('subtotal', { precision: 10, scale: 2 }),
  status:           text('status').notNull().default('pending'),
  notes:            text('notes'),
  createdAt:        timestamp('created_at').defaultNow(),
  updatedAt:        timestamp('updated_at').defaultNow(),
});

export type OrderItem = {
  productId: number;
  slug: string;
  name: string;
  model: string;
  priceBob: string | null;
  imageUrl: string | null;
  quantity: number;
};

export type StoreSettings = typeof storeSettings.$inferSelect;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type FAQ = typeof faqs.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type NewHeroSlide = typeof heroSlides.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type AnnouncementMessage = typeof announcementMessages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
