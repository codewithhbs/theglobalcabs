'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(params.get('next') || (user.role === 'admin' ? '/admin' : '/dashboard'));
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <section className="grid min-h-[70vh] place-items-center bg-mist py-16">
      <div className="card w-full max-w-md p-8">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold">Sign in to your account</h1>
        <div className="mt-7 grid gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn-primary justify-center" onClick={submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link href="/register" className="font-semibold text-amber-600 hover:underline">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="grid min-h-[70vh] place-items-center bg-mist" />}> 
      <LoginInner />
    </Suspense>
  );
}
