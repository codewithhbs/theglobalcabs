'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { StatusBadge } from '@/components/admin/Shared';
import { Icon } from '@/components/Icons';

const STATUSES = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];

export default function AdminTourBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, v, d] = await Promise.all([
        api('/tours/bookings?limit=300&sort=-createdAt'),
        api('/vehicles?limit=100'),
        api('/drivers?limit=200'),
      ]);
      setBookings(b.data);
      setVehicles(v.data);
      setDrivers(d.data);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [
      b.bookingId,
      b.customer?.name,
      b.guestDetails?.name,
      b.customer?.phone,
      b.guestDetails?.phone,
      b.tour?.title,
      b.pickupLocation,
    ].some((x) => String(x || '').toLowerCase().includes(q));
  });

  const exportCsv = () => {
    const token = localStorage.getItem('gc_token');
    fetch(`${API_BASE}/api/v1/tours/bookings/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tour-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Tour Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage holiday tour package bookings — update status, change vehicle, export reports.</p>
        </div>
        <button className="btn-dark !px-4 !py-2 text-sm" onClick={exportCsv}>
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search ID, name, phone, tour…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                filter === s ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
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
              <th className="px-5 py-3.5 font-bold">Tour</th>
              <th className="px-5 py-3.5 font-bold">Travel date</th>
              <th className="px-5 py-3.5 font-bold">Vehicle</th>
              <th className="px-5 py-3.5 font-bold">Driver</th>
              <th className="px-5 py-3.5 font-bold">Fare</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No tour bookings yet.</td></tr>}
            {filtered.map((b) => (
              <tr key={b._id} className="hover:bg-mist/60">
                <td className="px-5 py-3.5 font-bold">{b.bookingId}</td>
                <td className="px-5 py-3.5">
                  <p className="font-semibold">{b.customer?.name || b.guestDetails?.name || '—'}</p>
                  <p className="text-xs text-slate-400">{b.customer?.phone || b.guestDetails?.phone || ''}</p>
                </td>
                <td className="max-w-[220px] px-5 py-3.5">
                  <p className="truncate text-xs font-semibold text-ink">{b.tour?.title || '—'}</p>
                  <p className="text-[11px] text-slate-400">
                    {b.tour?.fromLocation} → {b.tour?.toLocation} · {b.travellers} pax
                  </p>
                </td>
                <td className="px-5 py-3.5 text-xs">
                  {new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 text-xs">{b.vehicle?.name || '—'}</td>
                <td className="px-5 py-3.5 text-xs">
                  {b.driver?.name ? (
                    <span>
                      {b.driver.name}
                      {b.driver.phone && <span className="block text-[10px] text-slate-400">{b.driver.phone}</span>}
                    </span>
                  ) : (
                    <span className="text-slate-400">— Unassigned —</span>
                  )}
                </td>
                <td className="px-5 py-3.5 font-display font-extrabold text-amber-600">₹{b.fare?.total?.toLocaleString('en-IN')}</td>
                <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600"
                    onClick={() => setSelected(b)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ManageModal
          booking={selected}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}

function ManageModal({ booking, vehicles, drivers, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: booking.status,
    vehicle: booking.vehicle?._id || booking.vehicle || '',
    driver: booking.driver?._id || booking.driver || '',
    notes: booking.notes || '',
    pickupLocation: booking.pickupLocation || '',
    travelDate: booking.travelDate ? new Date(booking.travelDate).toISOString().slice(0, 10) : '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = {
        status: form.status,
        notes: form.notes,
        pickupLocation: form.pickupLocation,
        travelDate: form.travelDate,
      };
      if (form.vehicle) body.vehicle = form.vehicle;
      // Send driver explicitly so admin can also un-assign by selecting "— Unassigned —"
      body.driver = form.driver || null;
      await api(`/tours/bookings/${booking._id}`, { method: 'PATCH', body });
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-7 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{booking.bookingId}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-mist p-4">
          <p className="font-display text-base font-extrabold text-ink">{booking.tour?.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {booking.tour?.fromLocation} → {booking.tour?.toLocation} ·{' '}
            {booking.tour?.durationDays}D{booking.tour?.durationNights ? `/${booking.tour.durationNights}N` : ''}
          </p>
          <div className="mt-3 grid gap-1 text-xs text-slate-500">
            <p>
              <b>Customer:</b> {booking.customer?.name || booking.guestDetails?.name}
              {' · '}{booking.customer?.phone || booking.guestDetails?.phone}
              {(booking.customer?.email || booking.guestDetails?.email) && ` · ${booking.customer?.email || booking.guestDetails?.email}`}
            </p>
            <p><b>Travel:</b> {new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><b>Pickup:</b> {booking.pickupLocation}</p>
            <p><b>Travellers:</b> {booking.travellers}</p>
            <p><b>Vehicle:</b> {booking.vehicle?.name || '—'}</p>
            <p><b>Driver:</b> {booking.driver?.name ? `${booking.driver.name} · ${booking.driver.phone}` : '— Unassigned —'}</p>
            {booking.notes && <p><b>Customer notes:</b> {booking.notes}</p>}
          </div>
          {booking.fare?.breakdown?.length > 0 && (
            <div className="mt-3 border-t border-slate-200 pt-3 text-xs">
              {booking.fare.breakdown.map((l, i) => (
                <div key={i} className="flex justify-between text-slate-500">
                  <span>{l.label}</span><span>₹{l.amount?.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between font-bold text-ink">
                <span>Total</span><span>₹{booking.fare.total?.toLocaleString('en-IN')}</span>
              </div>
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
            <label className="label">Assigned vehicle</label>
            <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
              <option value="">— Unassigned —</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Assigned driver</label>
            <select className="input" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}>
              <option value="">— Unassigned —</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} · {d.phone} ({d.availability})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Travel date</label>
            <input type="date" className="input" value={form.travelDate} onChange={(e) => setForm({ ...form, travelDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Pickup location</label>
            <input className="input" value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Admin / customer notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}