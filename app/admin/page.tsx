export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllProductsAdmin } from '@/lib/products';
import { Package, AlertTriangle, CheckCircle, Megaphone } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default async function AdminDashboard() {
  const products = await getAllProductsAdmin();

  const total = products.length;
  const active = products.filter((p) => p.isActive).length;
  const withPrice = products.filter((p) => p.priceBob !== null).length;
  const withoutPrice = total - withPrice;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de productos</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Package size={22} className="text-[var(--color-primary)]" />}
          label="Productos activos"
          value={String(active)}
        />
        <StatCard
          icon={<CheckCircle size={22} className="text-green-600" />}
          label="Con precio en BOB"
          value={String(withPrice)}
        />
        <StatCard
          icon={<AlertTriangle size={22} className="text-amber-500" />}
          label="Sin precio"
          value={String(withoutPrice)}
          warning={withoutPrice > 0}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          <Package size={18} />
          Gestionar productos
        </Link>
        <Link
          href="/admin/anuncio"
          className="inline-flex items-center gap-2 border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
        >
          <Megaphone size={18} />
          Barra de anuncios
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, warning = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${warning ? 'border-amber-200 bg-amber-50' : 'border-gray-200'}`}>
      {icon}
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
