'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors border border-gray-300 px-4 py-2 rounded-lg hover:border-red-300"
    >
      <LogOut size={16} />
      Cerrar sesión
    </button>
  );
}
