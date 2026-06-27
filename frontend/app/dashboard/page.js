'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import BookingCard from '@/components/dashboard/BookingCard';
import TourBookingCard from '../../components/dashboard/TourBookingCard';
// import TourBookingCard from '@/components/dashboard/TourBookingCard';

export default function DashboardHome() {
  const { user } = useAuth();
  const [upcomingCabs, setUpcomingCabs] = useState([]);
  const [upcomingTours, setUpcomingTours] = useState([]);
  const [allCabs, setAllCabs] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [upCab, allCab, upTour, allTour] = await Promise.all([
        api('/bookings/my?upcoming=true').catch(() => ({ data: [] })),
        api('/bookings/my').catch(() => ({ data: [] })),
        api('/tours/bookings/my?upcoming=true').catch(() => ({ data: [] })),
        api('/tours/bookings/my').catch(() => ({ data: [] })),
      ]);
      setUpcomingCabs(upCab.data || []);
      setAllCabs(allCab.data || []);
      setUpcomingTours(upTour.data || []);
      setAllTours(allTour.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Combined upcoming list sorted by date — cabs use pickupDate, tours use travelDate
  const upcoming = [
    ...upcomingCabs.map((b) => ({ ...b, _kind: 'cab', _when: b.pickupDate })),
    ...upcomingTours.map((b) => ({ ...b, _kind: 'tour', _when: b.travelDate })),
  ].sort((a, b) => new Date(a._when) - new Date(b._when));

  const totalTrips = allCabs.length + allTours.length;
  const completedCount =
    allCabs.filter((b) => b.status === 'completed').length +
    allTours.filter((b) => b.status === 'completed').length;
  const totalSpent =
    allCabs.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.fare?.total || 0), 0) +
    allTours.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.fare?.total || 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Hi {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s coming up.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Total trips', totalTrips],
          ['Completed', completedCount],
          ['Total spent', `₹${totalSpent.toLocaleString('en-IN')}`],
        ].map(([l, v]) => (
          <div key={l} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{l}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold">Upcoming trips</h2>
        <div className="flex gap-2">
          <Link href="/tours" className="btn-ghost !px-4 !py-2 text-sm">Browse tours</Link>
          <Link href="/fare-calculator" className="btn-primary !px-4 !py-2 text-sm">+ New booking</Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {!loading && upcoming.length === 0 && (
          <div className="card p-8 text-center">
            <p className="font-semibold text-slate-600">No upcoming trips.</p>
            <p className="mt-1 text-sm text-slate-400">Book a cab or tour and it&apos;ll show up here.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/fare-calculator" className="btn-primary">Book a cab</Link>
              <Link href="/tours" className="btn-ghost">Explore tours</Link>
            </div>
          </div>
        )}
        {upcoming.map((b) => (
          b._kind === 'tour'
            ? <TourBookingCard key={`t-${b._id}`} booking={b} onChanged={load} />
            : <BookingCard key={`c-${b._id}`} booking={b} onChanged={load} />
        ))}
      </div>

      {!loading && totalTrips > upcoming.length && (
        <p className="mt-6 text-sm text-slate-500">
          Looking for past trips? <Link href="/dashboard/bookings" className="font-semibold text-amber-600 hover:underline">View full history →</Link>
        </p>
      )}
    </div>
  );
}