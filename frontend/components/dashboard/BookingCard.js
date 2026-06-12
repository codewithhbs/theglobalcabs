'use client';
import { useState } from 'react';
import RouteLine from '@/components/RouteLine';
import { Icon } from '@/components/Icons';
import { api, API_BASE } from '@/lib/api';

export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  ongoing: 'bg-violet-50 text-violet-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
};

export function fmtDateTime(d) {
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function BookingCard({ booking, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancellable = ['pending', 'confirmed'].includes(booking.status);

  const cancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    setBusy(true);
    setError('');
    try {
      await api(`/bookings/my/${booking._id}/cancel`, { method: 'PATCH' });
      onChanged?.();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const downloadInvoice = () => {
    const token = localStorage.getItem('gc_token');
    fetch(`${API_BASE}/api/v1/bookings/${booking._id}/invoice`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error('Invoice not available'); return r.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${booking.bookingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => setError(e.message));
  };

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="font-display font-extrabold">{booking.bookingId}</p>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[booking.status] || 'bg-mist text-slate-500'}`}>{booking.status}</span>
        </div>
        <p className="font-display text-lg font-extrabold text-amber-600">₹{booking.fare?.total}</p>
      </div>

      <div className="mt-5">
        <RouteLine from={booking.pickupLocation} to={booking.dropLocation} />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Icon name="calendar" className="h-4 w-4" /> {fmtDateTime(booking.pickupDateTime)}</span>
        <span className="flex items-center gap-1.5"><Icon name="car" className="h-4 w-4" /> {booking.vehicle?.name || 'Vehicle TBA'}</span>
        {booking.driver?.name && <span className="flex items-center gap-1.5"><Icon name="users" className="h-4 w-4" /> {booking.driver.name} · {booking.driver.phone}</span>}
        <span className="flex items-center gap-1.5 capitalize"><Icon name="flag" className="h-4 w-4" /> {booking.tripType}</span>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <button className="btn-ghost !px-4 !py-2 text-sm" onClick={downloadInvoice}>
          <Icon name="download" className="h-4 w-4" /> Invoice
        </button>
        {cancellable && (
          <button className="btn !px-4 !py-2 text-sm border border-red-200 text-red-600 hover:bg-red-50" onClick={cancel} disabled={busy}>
            {busy ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </div>
  );
}
