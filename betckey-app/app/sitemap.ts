import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://etibolivia.com';

  const slugs = ['dk-1201', 'dk-1202', 'dk-1241', 'dk-2205'];

  try {
    const { getAllProducts } = await import('@/lib/products');
    const products = await getAllProducts();
    const productUrls = products.map((p) => ({
      url: `${base}/productos/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [
      { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${base}/catalogo`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      ...productUrls,
    ];
  } catch {
    return [
      { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${base}/catalogo`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      ...slugs.map((slug) => ({
        url: `${base}/productos/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  }
}
