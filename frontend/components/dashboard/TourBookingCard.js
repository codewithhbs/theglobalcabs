'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icons';
import { api } from '@/lib/api';
import { STATUS_STYLES } from './BookingCard';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function TourBookingCard({ booking, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancellable = ['pending', 'confirmed'].includes(booking.status);

  const cancel = async () => {
    if (!confirm('Cancel this tour booking?')) return;
    setBusy(true);
    setError('');
    try {
      await api(`/tours/bookings/my/${booking._id}/cancel`, { method: 'PATCH' });
      onChanged?.();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="font-display font-extrabold">{booking.bookingId}</p>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
              STATUS_STYLES[booking.status] || 'bg-mist text-slate-500'
            }`}
          >
            {booking.status}
          </span>
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Tour
          </span>
        </div>
        <p className="font-display text-lg font-extrabold text-amber-600">
          ₹{booking.fare?.total?.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="mt-4">
        <p className="font-display text-base font-extrabold text-ink">
          {booking.tour?.title || 'Tour package'}
        </p>
        {booking.tour && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="pin" className="h-3.5 w-3.5" />
            {booking.tour.fromLocation} → {booking.tour.toLocation}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Icon name="calendar" className="h-4 w-4" /> {fmtDate(booking.travelDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="car" className="h-4 w-4" /> {booking.vehicle?.name || 'Vehicle TBA'}
        </span>
        {booking.driver?.name && (
          <span className="flex items-center gap-1.5">
            <Icon name="users" className="h-4 w-4" />
            {booking.driver.name}
            {booking.driver.phone && <span className="text-slate-400"> · {booking.driver.phone}</span>}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Icon name="users" className="h-4 w-4" /> {booking.travellers} traveller{booking.travellers > 1 ? 's' : ''}
        </span>
        {booking.tour?.durationDays && (
          <span className="flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4" />
            {booking.tour.durationDays}D
            {booking.tour.durationNights ? `/${booking.tour.durationNights}N` : ''}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Icon name="pin" className="h-4 w-4" /> Pickup: {booking.pickupLocation}
        </span>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      {cancellable && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <button
            className="btn !px-4 !py-2 text-sm border border-red-200 text-red-600 hover:bg-red-50"
            onClick={cancel}
            disabled={busy}
          >
            {busy ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      )}
    </div>
  );
}