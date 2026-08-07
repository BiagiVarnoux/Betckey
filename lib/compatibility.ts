import { db } from './db';
import { printers, productPrinters } from './db/schema';
import { asc, eq, inArray } from 'drizzle-orm';
import { getAllProducts, type ProductWithImages } from './products';

export type PrinterOption = { id: number; brand: string; model: string };

export type SizeOption = {
  key: string;        // '62x100'
  label: string;      // '62mm × 100mm'
  widthMm: number;
  heightMm: number;   // 0 = continua
};

export type FinderProduct = ProductWithImages & { printerIds: number[] };

export type CompatibilityData = {
  brands: string[];                         // solo marcas que tienen productos activos
  printersByBrand: Record<string, PrinterOption[]>;
  sizesByBrand: Record<string, SizeOption[]>;
  products: FinderProduct[];
};

export function sizeKey(widthMm: number, heightMm: number): string {
  return `${widthMm}x${heightMm}`;
}

export function sizeLabel(widthMm: number, heightMm: number): string {
  return heightMm > 0 ? `${widthMm}mm × ${heightMm}mm` : `${widthMm}mm continua`;
}

/**
 * Todo lo que necesita el buscador de compatibilidad, en una sola consulta.
 * El catálogo es chico, así que se filtra en el navegador: sin recargas ni esperas.
 */
export async function getCompatibilityData(): Promise<CompatibilityData> {
  const all = await getAllProducts();

  const links = all.length
    ? await db.select().from(productPrinters).where(inArray(productPrinters.productId, all.map(p => p.id)))
    : [];

  const products: FinderProduct[] = all.map(p => ({
    ...p,
    printerIds: links.filter(l => l.productId === p.id).map(l => l.printerId),
  }));

  // Solo marcas con productos, en el orden en que aparecen en el catálogo
  const brands = [...new Set(products.map(p => p.brand))];

  const allPrinters = await db
    .select({ id: printers.id, brand: printers.brand, model: printers.model })
    .from(printers)
    .where(eq(printers.isActive, true))
    .orderBy(asc(printers.sortOrder), asc(printers.model));

  const printersByBrand: Record<string, PrinterOption[]> = {};
  const sizesByBrand: Record<string, SizeOption[]> = {};

  for (const brand of brands) {
    // Solo impresoras que sirven para algún producto de esa marca
    const usable = new Set(products.filter(p => p.brand === brand).flatMap(p => p.printerIds));
    printersByBrand[brand] = allPrinters.filter(pr => pr.brand === brand && usable.has(pr.id));

    const sizes = new Map<string, SizeOption>();
    for (const p of products.filter(p => p.brand === brand)) {
      const key = sizeKey(p.widthMm, p.heightMm);
      if (!sizes.has(key)) {
        sizes.set(key, { key, label: sizeLabel(p.widthMm, p.heightMm), widthMm: p.widthMm, heightMm: p.heightMm });
      }
    }
    sizesByBrand[brand] = [...sizes.values()].sort((a, b) => a.widthMm - b.widthMm || a.heightMm - b.heightMm);
  }

  return { brands, printersByBrand, sizesByBrand, products };
}
