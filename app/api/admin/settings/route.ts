import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStoreSettings, upsertStoreSettings } from '@/lib/settings';

async function requireAdmin() {
  const c = await cookies();
  return c.get('admin_session')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const body = await request.json();
  const green  = Number(body.stockGreenThreshold);
  const yellow = Number(body.stockYellowThreshold);

  if (isNaN(green) || isNaN(yellow) || yellow >= green || yellow < 1 || green < 2) {
    return NextResponse.json(
      { error: 'Valores inválidos. El umbral amarillo debe ser menor que el verde y ambos deben ser positivos.' },
      { status: 400 },
    );
  }

  await upsertStoreSettings({ stockGreenThreshold: green, stockYellowThreshold: yellow });
  return NextResponse.json({ ok: true });
}
