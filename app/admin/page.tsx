export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
  Package, AlertTriangle, CheckCircle, ShoppingBag,
  Settings2, Phone, Tag, HelpCircle, Images, ArrowRight,
} from 'lucide-react';
import { getDb } from '@/lib/db';
import { getAllProductsAdmin } from '@/lib/products';
import { orders } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import LogoutButton from './LogoutButton';

export default async function AdminDashboard() {
  const db = getDb();
  const [products, [{ pendingCount }]] = await Promise.all([
    getAllProductsAdmin(),
    db.select({ pendingCount: count() }).from(orders).where(eq(orders.status, 'pending')),
  ]);

  const active      = products.filter(p => p.isActive).length;
  const withPrice   = products.filter(p => p.priceBob !== null).length;
  const withoutPrice = products.length - withPrice;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bienvenido de vuelta</p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard value={String(active)} label="Productos activos" color="blue" icon={<Package size={18} />} />
        <StatCard value={String(withPrice)} label="Con precio" color="green" icon={<CheckCircle size={18} />} />
        <StatCard value={String(withoutPrice)} label="Sin precio" color={withoutPrice > 0 ? 'amber' : 'gray'} icon={<AlertTriangle size={18} />} />
        <StatCard value={String(pendingCount)} label="Pedidos pendientes" color={pendingCount > 0 ? 'blue' : 'gray'} icon={<ShoppingBag size={18} />} href="/admin/pedidos" />
      </div>

      {/* Secciones */}
      <div className="flex flex-col gap-8">

        <NavSection title="Catálogo" description="Productos y contenido de las páginas de producto">
          <NavCard href="/admin/productos" icon={<Package size={20} />} title="Productos" description="Agrega, edita y gestiona el stock y precios" primary />
          <NavCard href="/admin/faqs" icon={<HelpCircle size={20} />} title="Preguntas frecuentes" description="Las FAQ que aparecen en cada producto" />
        </NavSection>

        <NavSection title="Marketing" description="Lo que ven tus clientes al entrar al sitio">
          <NavCard href="/admin/contenido" icon={<Images size={20} />} title="Banners y anuncios" description="Slider del inicio y barra de mensajes superior" />
          <NavCard href="/admin/cupones" icon={<Tag size={20} />} title="Cupones de descuento" description="Códigos de descuento por % o monto fijo" />
        </NavSection>

        <NavSection title="Ventas" description="Pedidos recibidos a través del sitio">
          <NavCard href="/admin/pedidos" icon={<ShoppingBag size={20} />} title="Pedidos" description="Consulta y gestiona los pedidos de clientes" badge={pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}` : undefined} />
        </NavSection>

        <NavSection title="Configuración" description="Datos de contacto y ajustes de la tienda">
          <NavCard href="/admin/contacto" icon={<Phone size={20} />} title="Información de contacto" description="WhatsApp, email, dirección e imagen del banner" />
          <NavCard href="/admin/configuracion" icon={<Settings2 size={20} />} title="Ajustes de stock" description="Umbrales para los indicadores de disponibilidad" />
        </NavSection>

      </div>
    </div>
  );
}

/* ── Componentes ─────────────────────────────────────────── */

type Color = 'blue' | 'green' | 'amber' | 'gray';

const colorMap: Record<Color, { bg: string; text: string; icon: string }> = {
  blue:  { bg: 'bg-blue-50',   text: 'text-blue-700',  icon: 'text-[var(--color-primary)]' },
  green: { bg: 'bg-green-50',  text: 'text-green-700', icon: 'text-green-600' },
  amber: { bg: 'bg-amber-50',  text: 'text-amber-700', icon: 'text-amber-500' },
  gray:  { bg: 'bg-gray-50',   text: 'text-gray-600',  icon: 'text-gray-400' },
};

function StatCard({ value, label, color, icon, href }: {
  value: string; label: string; color: Color; icon: React.ReactNode; href?: string;
}) {
  const c = colorMap[color];
  const inner = (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${c.bg} border-transparent`}>
      <span className={c.icon}>{icon}</span>
      <div>
        <p className={`text-xl font-bold ${c.text}`}>{value}</p>
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href} className="hover:opacity-80 transition-opacity">{inner}</Link> : <div>{inner}</div>;
}

function NavSection({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function NavCard({ href, icon, title, description, primary = false, badge }: {
  href: string; icon: React.ReactNode; title: string; description: string; primary?: boolean; badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${
        primary
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
          : 'bg-white border-gray-200 text-gray-900 hover:border-[var(--color-primary)]/30'
      }`}
    >
      <span className={`p-2.5 rounded-xl shrink-0 ${primary ? 'bg-white/20' : 'bg-[var(--color-primary)]/8 text-[var(--color-primary)]'}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-sm ${primary ? 'text-white' : 'text-gray-900'}`}>{title}</p>
          {badge && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
          )}
        </div>
        <p className={`text-xs mt-0.5 line-clamp-1 ${primary ? 'text-white/70' : 'text-gray-500'}`}>{description}</p>
      </div>
      <ArrowRight size={16} className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${primary ? 'text-white' : 'text-[var(--color-primary)]'}`} />
    </Link>
  );
}
