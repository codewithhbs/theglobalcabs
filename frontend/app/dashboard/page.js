'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import BookingCard from '@/components/dashboard/BookingCard';

export default function DashboardHome() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [up, allRes] = await Promise.all([
        api('/bookings/my?upcoming=true'),
        api('/bookings/my'),
      ]);
      setUpcoming(up.data);
      setAll(allRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const completed = all.filter((b) => b.status === 'completed').length;
  const spent = all.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.fare?.total || 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Hi {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s coming up.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Total trips', all.length],
          ['Completed', completed],
          ['Total spent', `₹${spent.toLocaleString('en-IN')}`],
        ].map(([l, v]) => (
          <div key={l} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{l}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold">Upcoming trips</h2>
        <Link href="/fare-calculator" className="btn-primary !px-4 !py-2 text-sm">+ New booking</Link>
      </div>

      <div className="mt-4 grid gap-4">
        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {!loading && upcoming.length === 0 && (
          <div className="card p-8 text-center">
            <p className="font-semibold text-slate-600">No upcoming trips.</p>
            <p className="mt-1 text-sm text-slate-400">Book a cab and it&apos;ll show up here.</p>
            <Link href="/fare-calculator" className="btn-primary mt-5">Book a cab</Link>
          </div>
        )}
        {upcoming.map((b) => <BookingCard key={b._id} booking={b} onChanged={load} />)}
      </div>

      {!loading && all.length > upcoming.length && (
        <p className="mt-6 text-sm text-slate-500">
          Looking for past trips? <Link href="/dashboard/bookings" className="font-semibold text-amber-600 hover:underline">View full history →</Link>
        </p>
      )}
    </div>
  );
}
