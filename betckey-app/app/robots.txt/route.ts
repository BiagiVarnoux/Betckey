import { NextResponse } from 'next/server';

export function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://etibolivia.com';
  const content = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/sitemap.xml
`;
  return new NextResponse(content, { headers: { 'Content-Type': 'text/plain' } });
}
