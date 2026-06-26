'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { StatusBadge } from '@/components/admin/Shared';
import RouteLine from '@/components/RouteLine';
import { Icon } from '@/components/Icons';

const STATUSES = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, d, v] = await Promise.all([
        api('/bookings?limit=300&sort=-createdAt'),
        api('/drivers?limit=200'),
        api('/vehicles?limit=100'),
      ]);
      setBookings(b.data);
      setDrivers(d.data);
      setVehicles(v.data);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [b.bookingId, b.customerName, b.customer?.name, b.customerPhone, b.pickupLocation, b.dropLocation]
      .some((x) => String(x || '').toLowerCase().includes(q));
  });

  const exportCsv = () => {
    const token = localStorage.getItem('gc_token');
    fetch(`${API_BASE}/api/v1/bookings/export/csv`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Assign drivers, update statuses, export reports.</p>
        </div>
        <button className="btn-dark !px-4 !py-2 text-sm" onClick={exportCsv}>
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Search ID, name, phone, route…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${filter === s ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-bold">Booking</th>
              <th className="px-5 py-3.5 font-bold">Customer</th>
              <th className="px-5 py-3.5 font-bold">Trip</th>
              <th className="px-5 py-3.5 font-bold">Pickup</th>
              <th className="px-5 py-3.5 font-bold">Fare</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No bookings found.</td></tr>}
            {filtered.map((b) => (
              <tr key={b._id} className="hover:bg-mist/60">
                <td className="px-5 py-3.5 font-bold">{b.bookingId}</td>
                <td className="px-5 py-3.5">
                  <p className="font-semibold">{b.customerName || b.customer?.name}</p>
                  <p className="text-xs text-slate-400">{b.customerPhone || b.customer?.phone}</p>
                </td>
                <td className="max-w-[220px] px-5 py-3.5">
                  <p className="truncate text-xs">{b.pickupLocation} → {b.dropLocation}</p>
                  <p className="text-[11px] capitalize text-slate-400">{b.tripType} · {b.vehicle?.name || '—'}</p>
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {new Date(b.pickupDate).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="px-5 py-3.5 font-display font-extrabold text-amber-600">₹{b.fare?.total}</td>
                <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600" onClick={() => setSelected(b)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ManageModal booking={selected} drivers={drivers} vehicles={vehicles} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />
      )}
    </div>
  );
}

function ManageModal({ booking, drivers, vehicles, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: booking.status,
    driver: booking.driver?._id || booking.driver || '',
    vehicle: booking.vehicle?._id || booking.vehicle || '',
    adminNotes: booking.adminNotes || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = { status: form.status, adminNotes: form.adminNotes };
      if (form.driver) body.driver = form.driver;
      if (form.vehicle) body.vehicle = form.vehicle;
      await api(`/bookings/${booking._id}`, { method: 'PATCH', body });
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const downloadInvoice = () => {
    const token = localStorage.getItem('gc_token');
    fetch(`${API_BASE}/api/v1/bookings/${booking._id}/invoice`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${booking.bookingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-7 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{booking.bookingId}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Icon name="x" className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 rounded-xl bg-mist p-4">
          <RouteLine from={booking.pickupLocation} to={booking.dropLocation} />
          <div className="mt-3 grid gap-1 text-xs text-slate-500">
            <p><b>Customer:</b> {booking.customerName || booking.customer?.name} · {booking.customerPhone || booking.customer?.phone} · {booking.customerEmail || booking.customer?.email}</p>
            <p><b>Pickup:</b> {new Date(booking.pickupDate).toLocaleString('en-IN')}</p>
            <p className="capitalize"><b>Trip:</b> {booking.tripType} · {booking.distanceKm} km · {booking.passengers} pax</p>
            {booking.notes && <p><b>Customer notes:</b> {booking.notes}</p>}
          </div>
          {booking.fare?.breakdown?.length > 0 && (
            <div className="mt-3 border-t border-slate-200 pt-3 text-xs">
              {booking.fare.breakdown.map((l, i) => (
                <div key={i} className="flex justify-between text-slate-500"><span>{l.label}</span><span>₹{l.amount}</span></div>
              ))}
              <div className="mt-1 flex justify-between font-bold text-ink"><span>Total</span><span>₹{booking.fare.total}</span></div>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assign vehicle</label>
            <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
              <option value="">— Unassigned —</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Assign driver</label>
            <select className="input" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}>
              <option value="">— Unassigned —</option>
              {drivers.map((d) => <option key={d._id} value={d._id}>{d.name} · {d.phone} ({d.availability})</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Admin notes</label>
            <textarea className="input" rows={2} value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
          <button className="btn-ghost !px-4 !py-2 text-sm" onClick={downloadInvoice}><Icon name="download" className="h-4 w-4" /> Invoice</button>
          <div className="flex gap-3">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
