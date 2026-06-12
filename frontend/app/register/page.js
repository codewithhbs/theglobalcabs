'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.name || !form.email || !form.phone || !form.password) return setError('All fields are required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <section className="grid min-h-[70vh] place-items-center bg-mist py-16">
      <div className="card w-full max-w-md p-8">
        <p className="eyebrow">Get started</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Track bookings, download invoices and cancel in one tap.</p>
        <div className="mt-7 grid gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98xxxxxx" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button className="btn-primary justify-center" onClick={submit} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link href="/login" className="font-semibold text-amber-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
