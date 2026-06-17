import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json() as { code: string; subtotal: number };
    if (!code?.trim()) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const db = getDb();
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.trim().toUpperCase()))
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ error: 'Cupón no válido' }, { status: 404 });
    }
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Este cupón está inactivo' }, { status: 400 });
    }
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json({ error: 'Este cupón ha expirado' }, { status: 400 });
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Este cupón ya alcanzó su límite de usos' }, { status: 400 });
    }

    const value = parseFloat(coupon.discountValue);
    const discountAmount =
      coupon.discountType === 'percentage'
        ? (subtotal * value) / 100
        : Math.min(value, subtotal);

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
