import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, createUserSessionToken, USER_SESSION_COOKIE } from '@/lib/user-auth';

export async function POST(req: Request) {
  try {
    const { email, password, name, lastName } = await req.json();

    if (!email?.trim() || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email y contraseña (mínimo 6 caracteres) son requeridos.' }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese correo.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() ?? '',
      lastName: lastName?.trim() ?? '',
    }).returning({ id: users.id, email: users.email, name: users.name, lastName: users.lastName });

    const token = await createUserSessionToken(user.id);
    const jar = await cookies();
    jar.set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
