'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/Shared';
import ResourceManager from '@/components/admin/ResourceManager';
import { Icon } from '@/components/Icons';

export default function AdminFaresPage() {
  const [tab, setTab] = useState('fares');

  return (
    <div>
      <div className="flex gap-2">
        {[['fares', 'Fare rules'], ['coupons', 'Coupons']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === k ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'fares' ? <FareRules /> : <Coupons />}
      </div>
    </div>
  );
}

/* ---------------- Fare rules (custom: nested pricing windows + peak hours) ---------------- */

function FareRules() {
  const [rules, setRules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, r, v] = await Promise.all([
        api('/fares?limit=300'),
        api('/routes?limit=200'),
        api('/vehicles?limit=100'),
      ]);
      setRules(f.data);
      setRoutes(r.data);
      setVehicles(v.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (rule) => {
    if (!confirm('Delete this fare rule?')) return;
    try { await api(`/fares/${rule._id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Fare rules</h1>
          <p className="mt-1 text-sm text-slate-500">Fixed or per-km pricing per route + vehicle, with seasonal & peak-hour surcharges.</p>
        </div>
        <button className="btn-primary !px-4 !py-2 text-sm" onClick={() => setModal({})}>+ New fare rule</button>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-bold">Route</th>
              <th className="px-5 py-3.5 font-bold">Vehicle</th>
              <th className="px-5 py-3.5 font-bold">Type</th>
              <th className="px-5 py-3.5 font-bold">Fare</th>
              <th className="px-5 py-3.5 font-bold">Windows</th>
              <th className="px-5 py-3.5 font-bold">Peak</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && rules.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">No fare rules yet.</td></tr>}
            {rules.map((r) => (
              <tr key={r._id} className="hover:bg-mist/60">
                <td className="px-5 py-3.5 text-xs font-semibold">{r.route?.pickupLocation} → {r.route?.dropLocation}</td>
                <td className="px-5 py-3.5">{r.vehicle?.name}</td>
                <td className="px-5 py-3.5 capitalize">{r.fareType}</td>
                <td className="px-5 py-3.5 font-display font-extrabold text-amber-600">
                  {r.fareType === 'fixed' ? `₹${r.fixedFare}` : `₹${r.perKmRate}/km`}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{r.pricingWindows?.length || 0}</td>
                <td className="px-5 py-3.5 text-xs">{r.peakHours?.active ? `+${r.peakHours.percent}%` : '—'}</td>
                <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600" onClick={() => setModal(r)}>Edit</button>
                    <button className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50" onClick={() => remove(r)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <FareModal rule={modal._id ? modal : null} routes={routes} vehicles={vehicles} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}

function FareModal({ rule, routes, vehicles, onClose, onSaved }) {
  const [form, setForm] = useState({
    route: rule?.route?._id || '',
    vehicle: rule?.vehicle?._id || '',
    fareType: rule?.fareType || 'fixed',
    fixedFare: rule?.fixedFare ?? '',
    perKmRate: rule?.perKmRate ?? '',
    minimumFare: rule?.minimumFare ?? '',
    status: rule?.status || 'active',
    peakHours: rule?.peakHours || { active: false, start: '22:00', end: '06:00', percent: 10 },
    pricingWindows: rule?.pricingWindows?.map((w) => ({ ...w, from: w.from?.slice(0, 10) || '', to: w.to?.slice(0, 10) || '' })) || [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const setWindow = (i, k, v) => setForm((f) => ({
    ...f,
    pricingWindows: f.pricingWindows.map((w, idx) => (idx === i ? { ...w, [k]: v } : w)),
  }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = {
        ...form,
        fixedFare: form.fixedFare === '' ? undefined : Number(form.fixedFare),
        perKmRate: form.perKmRate === '' ? undefined : Number(form.perKmRate),
        minimumFare: form.minimumFare === '' ? 0 : Number(form.minimumFare),
        peakHours: { ...form.peakHours, percent: Number(form.peakHours.percent) || 0 },
        pricingWindows: form.pricingWindows
          .filter((w) => w.label && w.from && w.to)
          .map((w) => ({ ...w, value: Number(w.value) || 0 })),
      };
      if (rule) await api(`/fares/${rule._id}`, { method: 'PATCH', body });
      else await api('/fares', { method: 'POST', body });
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-7 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{rule ? 'Edit' : 'New'} fare rule</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Icon name="x" className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Route *</label>
            <select className="input" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} disabled={!!rule}>
              <option value="">Select route…</option>
              {routes.map((r) => <option key={r._id} value={r._id}>{r.pickupLocation} → {r.dropLocation}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Vehicle *</label>
            <select className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} disabled={!!rule}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Fare type</label>
            <select className="input" value={form.fareType} onChange={(e) => setForm({ ...form, fareType: e.target.value })}>
              <option value="fixed">Fixed</option>
              <option value="perKm">Per km</option>
            </select>
          </div>
          {form.fareType === 'fixed' ? (
            <div>
              <label className="label">Fixed fare (₹) *</label>
              <input className="input" type="number" value={form.fixedFare} onChange={(e) => setForm({ ...form, fixedFare: e.target.value })} />
            </div>
          ) : (
            <div>
              <label className="label">Per-km rate (₹) *</label>
              <input className="input" type="number" value={form.perKmRate} onChange={(e) => setForm({ ...form, perKmRate: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label">Minimum fare (₹)</label>
            <input className="input" type="number" value={form.minimumFare} onChange={(e) => setForm({ ...form, minimumFare: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Peak hours */}
        <div className="mt-6 rounded-xl border border-slate-100 p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
            <input type="checkbox" className="h-4 w-4 accent-amber-500" checked={form.peakHours.active} onChange={(e) => setForm({ ...form, peakHours: { ...form.peakHours, active: e.target.checked } })} />
            Peak-hour surcharge
          </label>
          {form.peakHours.active && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Start</label>
                <input className="input" type="time" value={form.peakHours.start} onChange={(e) => setForm({ ...form, peakHours: { ...form.peakHours, start: e.target.value } })} />
              </div>
              <div>
                <label className="label">End</label>
                <input className="input" type="time" value={form.peakHours.end} onChange={(e) => setForm({ ...form, peakHours: { ...form.peakHours, end: e.target.value } })} />
              </div>
              <div>
                <label className="label">Surcharge %</label>
                <input className="input" type="number" value={form.peakHours.percent} onChange={(e) => setForm({ ...form, peakHours: { ...form.peakHours, percent: e.target.value } })} />
              </div>
            </div>
          )}
        </div>

        {/* Pricing windows */}
        <div className="mt-4 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Seasonal / festival pricing</p>
            <button className="text-xs font-bold text-amber-600 hover:underline" onClick={() => setForm((f) => ({ ...f, pricingWindows: [...f.pricingWindows, { label: '', from: '', to: '', type: 'percent', value: 10, active: true }] }))}>
              + Add window
            </button>
          </div>
          {form.pricingWindows.map((w, i) => (
            <div key={i} className="mt-3 grid items-end gap-2 rounded-lg bg-mist p-3 sm:grid-cols-[1.4fr,1fr,1fr,0.8fr,0.8fr,auto]">
              <div>
                <label className="label">Label</label>
                <input className="input !py-2" value={w.label} onChange={(e) => setWindow(i, 'label', e.target.value)} placeholder="Diwali Surge" />
              </div>
              <div>
                <label className="label">From</label>
                <input className="input !py-2" type="date" value={w.from} onChange={(e) => setWindow(i, 'from', e.target.value)} />
              </div>
              <div>
                <label className="label">To</label>
                <input className="input !py-2" type="date" value={w.to} onChange={(e) => setWindow(i, 'to', e.target.value)} />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input !py-2" value={w.type} onChange={(e) => setWindow(i, 'type', e.target.value)}>
                  <option value="percent">%</option>
                  <option value="flat">₹ flat</option>
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input className="input !py-2" type="number" value={w.value} onChange={(e) => setWindow(i, 'value', e.target.value)} />
              </div>
              <button className="mb-1 grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50" onClick={() => setForm((f) => ({ ...f, pricingWindows: f.pricingWindows.filter((_, idx) => idx !== i) }))}>
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Coupons (ResourceManager) ---------------- */

const couponConfig = {
  endpoint: '/fares/coupons',
  title: 'Coupons',
  subtitle: 'Discount codes applied at checkout.',
  singular: 'coupon',
  searchKeys: ['code'],
  columns: [
    { key: 'code', label: 'Code', render: (c) => <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-amber-400">{c.code}</span> },
    { key: 'type', label: 'Type' },
    { key: 'value', label: 'Value', render: (c) => (c.type === 'percent' ? `${c.value}%` : `₹${c.value}`) },
    { key: 'minBookingAmount', label: 'Min booking', render: (c) => `₹${c.minBookingAmount || 0}` },
    { key: 'usedCount', label: 'Used', render: (c) => `${c.usedCount}${c.usageLimit ? `/${c.usageLimit}` : ''}` },
    { key: 'validTo', label: 'Valid till', render: (c) => (c.validTo ? new Date(c.validTo).toLocaleDateString('en-IN') : '∞') },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  ],
  fields: [
    { name: 'code', label: 'Code', type: 'text', required: true, half: true, placeholder: 'WELCOME10' },
    { name: 'type', label: 'Type', type: 'select', half: true, options: ['percent', 'flat'] },
    { name: 'value', label: 'Value', type: 'number', required: true, half: true, hint: '% or ₹ depending on type' },
    { name: 'maxDiscount', label: 'Max discount (₹)', type: 'number', half: true, hint: 'For percent coupons' },
    { name: 'minBookingAmount', label: 'Min booking amount (₹)', type: 'number', half: true },
    { name: 'usageLimit', label: 'Usage limit', type: 'number', half: true, hint: '0 = unlimited' },
    { name: 'validFrom', label: 'Valid from', type: 'date', half: true },
    { name: 'validTo', label: 'Valid to', type: 'date', half: true },
    { name: 'status', label: 'Status', type: 'select', half: true, options: ['active', 'inactive'] },
  ],
  toForm: (c) => ({ ...c, validFrom: c.validFrom?.slice(0, 10) || '', validTo: c.validTo?.slice(0, 10) || '' }),
};

function Coupons() {
  return <ResourceManager config={couponConfig} />;
}
