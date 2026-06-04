export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStoreSettings } from '@/lib/settings';
import StockSettingsForm from './StockSettingsForm';

export default async function ConfiguracionPage() {
  const settings = await getStoreSettings();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500">Ajustes generales de la tienda</p>
        </div>
      </div>

      <StockSettingsForm settings={settings} />
    </div>
  );
}
