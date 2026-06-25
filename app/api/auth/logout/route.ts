import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_SESSION_COOKIE } from '@/lib/user-auth';

export async function POST() {
  const jar = await cookies();
  jar.delete(USER_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
