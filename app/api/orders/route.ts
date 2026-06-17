import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, coupons } from '@/lib/db/schema';
import type { OrderItem } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Resend } from 'resend';

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${ymd}-${rand}`;
}

function buildEmailHtml(orderNumber: string, customerName: string, customerWhatsapp: string, customerCity: string, items: OrderItem[], subtotal: number): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.name} (${item.model})</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.priceBob ? `Bs. ${(parseFloat(item.priceBob) * item.quantity).toFixed(2)}` : '—'}</td>
    </tr>
  `).join('');

  const waLink = `https://wa.me/${customerWhatsapp.replace(/\D/g, '')}`;

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e3a6e">🛒 Nuevo pedido: ${orderNumber}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="color:#666;padding:4px 0">Cliente</td><td style="font-weight:bold">${customerName}</td></tr>
        <tr><td style="color:#666;padding:4px 0">WhatsApp</td><td><a href="${waLink}" style="color:#25d366;font-weight:bold">${customerWhatsapp}</a></td></tr>
        <tr><td style="color:#666;padding:4px 0">Ciudad</td><td>${customerCity}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Producto</th>
            <th style="padding:8px;text-align:center">Cant.</th>
            <th style="padding:8px;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;margin-top:12px">Total: Bs. ${subtotal.toFixed(2)}</p>
      <p style="margin-top:24px">
        <a href="${waLink}" style="background:#25d366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          Contactar por WhatsApp →
        </a>
      </p>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerWhatsapp, customerCity, items, couponCode } = body as {
      customerName: string;
      customerWhatsapp: string;
      customerCity: string;
      items: OrderItem[];
      couponCode?: string;
    };

    if (!customerName?.trim() || !customerWhatsapp?.trim() || !customerCity?.trim() || !items?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => {
      return sum + (item.priceBob ? parseFloat(item.priceBob) * item.quantity : 0);
    }, 0);

    // Validar y aplicar cupón
    let discountAmount = 0;
    let appliedCouponId: number | null = null;
    if (couponCode?.trim()) {
      const db = getDb();
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.trim().toUpperCase()))
        .limit(1);

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt)) &&
        (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit)
      ) {
        const val = parseFloat(coupon.discountValue);
        discountAmount =
          coupon.discountType === 'percentage'
            ? parseFloat(((subtotal * val) / 100).toFixed(2))
            : Math.min(val, subtotal);
        appliedCouponId = coupon.id;
      }
    }

    const total = parseFloat((subtotal - discountAmount).toFixed(2));
    const orderNumber = generateOrderNumber();
    const db = getDb();

    await db.insert(orders).values({
      orderNumber,
      customerName: customerName.trim(),
      customerWhatsapp: customerWhatsapp.trim(),
      customerCity: customerCity.trim(),
      items,
      subtotal: total.toFixed(2),
      notes: appliedCouponId
        ? `Cupón: ${couponCode!.toUpperCase()} (−Bs. ${discountAmount.toFixed(2)})`
        : null,
    });

    // Incrementar uso del cupón
    if (appliedCouponId) {
      await db
        .update(coupons)
        .set({ usageCount: sql`${coupons.usageCount} + 1` })
        .where(eq(coupons.id, appliedCouponId));
    }

    // Enviar email si hay credenciales configuradas
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (resendKey && adminEmail && resendKey !== 'your_resend_api_key_here') {
      try {
        const resend = new Resend(resendKey);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'pedidos@yourdomain.com',
          to: adminEmail,
          subject: `Nuevo pedido ${orderNumber} — ${customerName}`,
          html: buildEmailHtml(orderNumber, customerName, customerWhatsapp, customerCity, items, subtotal),
        });
        console.log('[orders] email result:', JSON.stringify(result));
      } catch (emailErr) {
        console.error('[orders] email error:', emailErr);
      }
    }

    return NextResponse.json({ orderNumber }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
