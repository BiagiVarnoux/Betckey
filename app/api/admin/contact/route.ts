import { NextResponse } from 'next/server';
import { getContactInfo, upsertContactInfo } from '@/lib/contact';
import { verifySessionToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return verifySessionToken(token);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const info = await getContactInfo();
  return NextResponse.json(info);
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const body = await req.json();
  const { whatsapp, phone, email, address, city, businessHours } = body;
  const updated = await upsertContactInfo({ whatsapp, phone, email, address, city, businessHours });
  return NextResponse.json(updated);
}
