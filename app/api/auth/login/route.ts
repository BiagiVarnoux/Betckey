import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createUserSessionToken, USER_SESSION_COOKIE } from '@/lib/user-auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos.' }, { status: 400 });
    }

    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    const token = await createUserSessionToken(user.id);
    const jar = await cookies();
    jar.set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, lastName: user.lastName },
    });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
