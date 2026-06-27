'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import BookingCard from '@/components/dashboard/BookingCard';
import TourBookingCard from '@/components/dashboard/TourBookingCard';

const FILTERS = ['all', 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const [tab, setTab] = useState('cabs'); // 'cabs' | 'tours'
  const [cabBookings, setCabBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both in parallel so switching tabs is instant
      const [cab, tour] = await Promise.all([
        api('/bookings/my').catch(() => ({ data: [] })),
        api('/tours/bookings/my').catch(() => ({ data: [] })),
      ]);
      setCabBookings(cab.data || []);
      setTourBookings(tour.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeList = tab === 'cabs' ? cabBookings : tourBookings;
  const filtered = filter === 'all' ? activeList : activeList.filter((b) => b.status === filter);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">My bookings</h1>
      <p className="mt-1 text-sm text-slate-500">All your trips in one place — cab rides and tour packages.</p>

      {/* Cabs / Tours tabs */}
      <div className="mt-6 flex gap-2">
        {[
          ['cabs', 'Cab bookings', cabBookings.length],
          ['tours', 'Tour bookings', tourBookings.length],
        ].map(([k, label, count]) => (
          <button
            key={k}
            onClick={() => { setTab(k); setFilter('all'); }}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${
              tab === k ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {label}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              tab === k ? 'bg-amber-400 text-ink' : 'bg-slate-100 text-slate-500'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              filter === f ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-400">
            {tab === 'tours' ? 'No tour bookings found.' : 'No cab bookings found.'}
          </div>
        )}
        {filtered.map((b) => (
          tab === 'tours'
            ? <TourBookingCard key={b._id} booking={b} onChanged={load} />
            : <BookingCard key={b._id} booking={b} onChanged={load} />
        ))}
      </div>
    </div>
  );
}