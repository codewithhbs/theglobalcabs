'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import BookingCard from '@/components/dashboard/BookingCard';

const FILTERS = ['all', 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/bookings/my');
      setBookings(res.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">My bookings</h1>
      <p className="mt-1 text-sm text-slate-500">All your trips in one place — cancel or download invoices any time.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${filter === f ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {!loading && filtered.length === 0 && <div className="card p-8 text-center text-sm text-slate-400">No bookings found.</div>}
        {filtered.map((b) => <BookingCard key={b._id} booking={b} onChanged={load} />)}
      </div>
    </div>
  );
}
