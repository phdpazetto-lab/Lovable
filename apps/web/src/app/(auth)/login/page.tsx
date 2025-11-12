'use client';

import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-md w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">StarMKT OS</h1>
          <p className="text-sm text-slate-600">Acesse com sua conta Google corporativa.</p>
        </header>
        <button
          type="button"
          onClick={signIn}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
        >
          Entrar com Google
        </button>
      </div>
    </main>
  );
}
