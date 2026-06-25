'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const inputCls =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/cuenta');
      router.refresh();
    } else {
      setError(data.error ?? 'Error al iniciar sesión.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)]/10 mb-4">
            <LogIn size={22} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mt-1">Accedé a tu cuenta para ver tus pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email" required value={form.email} autoComplete="email"
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="tu@correo.com"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required value={form.password} autoComplete="current-password"
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className={inputCls + ' pr-10'}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
          >
            <LogIn size={18} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-1">
            ¿No tenés cuenta?{' '}
            <Link href="/cuenta/registro" className="text-[var(--color-primary)] font-medium hover:underline">
              Registrate gratis
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
