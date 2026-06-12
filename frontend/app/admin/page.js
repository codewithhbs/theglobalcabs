'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StatCard, StatusBadge } from '@/components/admin/Shared';
import RouteLine from '@/components/RouteLine';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard/stats').then((r) => setStats(r.data)).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!stats) return <p className="text-sm text-slate-400">Loading stats…</p>;

  const { totals, recentBookings, statusCounts, monthly } = stats;
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Business at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={`₹${totals.revenue.toLocaleString('en-IN')}`} icon="rupee" sub="Excludes cancelled" />
        <StatCard label="Total bookings" value={totals.bookings} icon="calendar" sub={`${totals.monthBookings} this month`} />
        <StatCard label="Pending bookings" value={totals.pendingBookings} icon="clock" sub="Need action" />
        <StatCard label="Customers" value={totals.customers} icon="users" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active routes" value={totals.activeRoutes} icon="pin" />
        <StatCard label="Vehicles" value={totals.vehicles} icon="car" />
        <StatCard label="Active drivers" value={totals.activeDrivers} icon="shield" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        {/* Revenue chart */}
        <div className="card p-6">
          <h2 className="font-display font-extrabold">Revenue — last 6 months</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">₹{(m.revenue / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-lg bg-amber-400 transition hover:bg-amber-500" style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 3)}%` }} title={`${m.bookings} bookings`} />
                <span className="text-[11px] text-slate-400">{m.month}</span>
              </div>
            ))}
            {monthly.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card p-6">
          <h2 className="font-display font-extrabold">Bookings by status</h2>
          <div className="mt-5 grid gap-3">
            {['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'].map((s) => (
              <div key={s} className="flex items-center justify-between rounded-xl bg-mist px-4 py-3">
                <StatusBadge status={s} />
                <span className="font-display font-extrabold">{statusCounts[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold">Recent bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-amber-600 hover:underline">View all →</Link>
        </div>
        <div className="mt-4 divide-y divide-slate-50">
          {recentBookings.map((b) => (
            <div key={b._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="text-sm font-bold">{b.bookingId} <span className="ml-2 font-normal text-slate-400">{b.customerName || b.customer?.name}</span></p>
                <div className="mt-1.5"><RouteLine from={b.pickupLocation} to={b.dropLocation} className="text-xs" /></div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-display font-extrabold text-amber-600">₹{b.fare?.total}</p>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
          {recentBookings.length === 0 && <p className="py-4 text-sm text-slate-400">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
