export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getContactInfo } from '@/lib/contact';
import ContactForm from './ContactForm';

export default async function ContactoAdminPage() {
  const info = await getContactInfo();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información de contacto</h1>
          <p className="text-sm text-gray-500">Datos que aparecen en la página de contacto y el footer</p>
        </div>
      </div>

      <ContactForm info={info} />
    </div>
  );
}
