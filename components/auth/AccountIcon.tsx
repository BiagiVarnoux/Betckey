'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserCircle } from 'lucide-react';

type Me = { id: number; name: string; lastName: string; email: string } | null;

export default function AccountIcon() {
  const [me, setMe] = useState<Me | undefined>(undefined); // undefined = loading

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  if (me === undefined) {
    return <div className="w-9 h-9" />; // placeholder durante carga
  }

  const initials = me
    ? [me.name[0], me.lastName[0]].filter(Boolean).join('').toUpperCase() || me.email[0].toUpperCase()
    : null;

  return (
    <Link
      href={me ? '/cuenta' : '/cuenta/login'}
      title={me ? `Mi cuenta (${me.email})` : 'Iniciar sesión'}
      className="flex items-center justify-center p-1 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
    >
      {initials ? (
        <span className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
      ) : (
        <UserCircle size={22} />
      )}
    </Link>
  );
}
