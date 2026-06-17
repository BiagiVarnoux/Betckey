import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { upsertContactInfo } from '@/lib/contact';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function isAuthenticated() {
  const c = await cookies();
  return verifySessionToken(c.get('admin_session')?.value);
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('imagen') as File | null;

  if (!file || file.size === 0) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Solo JPG, PNG o WebP' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Máximo 5 MB' }, { status: 400 });

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
  const filename = `contact/banner-${Date.now()}.${ext}`;
  const { url } = await put(filename, file, { access: 'public' });

  const updated = await upsertContactInfo({ bannerImageUrl: url });
  return NextResponse.json(updated);
}
