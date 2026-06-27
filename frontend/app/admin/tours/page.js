'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Icon } from '@/components/Icons';
import { StatusBadge } from '@/components/admin/Shared';

export default function AdminToursPage() {
  const [tours, setTours] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | { mode:'create' } | { mode:'edit', item }
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, v] = await Promise.all([
        api('/tours?limit=300&sort=-createdAt'),
        api('/vehicles?limit=100&status=active'),
      ]);
      setTours(t.data);
      setVehicles(v.data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tours.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [t.title, t.fromLocation, t.toLocation, t.category]
      .some((v) => String(v || '').toLowerCase().includes(q));
  });

  const remove = async (item) => {
    if (!confirm(`Delete tour "${item.title}"? This cannot be undone.`)) return;
    try { await api(`/tours/${item._id}`, { method: 'DELETE' }); load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Tours</h1>
          <p className="mt-1 text-sm text-slate-500">Holiday & multi-day tour packages with per-vehicle pricing.</p>
        </div>
        <button className="btn-primary !px-4 !py-2 text-sm" onClick={() => setModal({ mode: 'create' })}>
          + New tour
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search tours…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-slate-400">{filtered.length} of {tours.length}</span>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-bold">Image</th>
              <th className="px-5 py-3.5 font-bold">Title</th>
              <th className="px-5 py-3.5 font-bold">Route</th>
              <th className="px-5 py-3.5 font-bold">Duration</th>
              <th className="px-5 py-3.5 font-bold">Category</th>
              <th className="px-5 py-3.5 font-bold">From</th>
              <th className="px-5 py-3.5 font-bold">Cars</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No tours yet.</td></tr>}
            {filtered.map((t) => (
              <tr key={t._id} className="hover:bg-mist/60">
                <td className="px-5 py-3.5">
                  {t.image?.url
                    ? <span className="relative block h-10 w-16 overflow-hidden rounded-lg"><Image src={t.image.url} alt="" fill sizes="64px" className="object-cover" /></span>
                    : <span className="block h-10 w-16 rounded-lg bg-mist" />}
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink">{t.title}</div>
                  {t.isPopular && <span className="mt-0.5 inline-block text-[10px] font-bold uppercase tracking-wide text-amber-600">★ Popular</span>}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600">{t.fromLocation} → {t.toLocation}</td>
                <td className="px-5 py-3.5 text-xs text-slate-600">{t.durationDays}D{t.durationNights ? `/${t.durationNights}N` : ''}</td>
                <td className="px-5 py-3.5 capitalize text-xs">{t.category}</td>
                <td className="px-5 py-3.5 font-display font-extrabold text-amber-600">
                  {t.startingPrice > 0 ? `₹${t.startingPrice.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{t.vehiclePricing?.length || 0}</td>
                <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600"
                      onClick={() => setModal({ mode: 'edit', item: t })}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                      onClick={() => remove(t)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <TourModal
          mode={modal.mode}
          item={modal.item}
          vehicles={vehicles}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}

/* ---------------- Tour create / edit modal ---------------- */

function TourModal({ mode, item, vehicles, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const base = {
      title: '', fromLocation: '', toLocation: '',
      durationDays: 1, durationNights: 0, category: 'holiday',
      shortDescription: '', description: '',
      highlights: '', includes: '', excludes: '',
      isPopular: false, status: 'active',
      seoTitle: '', seoDescription: '',
      vehiclePricing: [],
      itinerary: [],
      image: null,
    };
    if (mode === 'edit' && item) {
      return {
        title: item.title || '',
        fromLocation: item.fromLocation || '',
        toLocation: item.toLocation || '',
        durationDays: item.durationDays ?? 1,
        durationNights: item.durationNights ?? 0,
        category: item.category || 'holiday',
        shortDescription: item.shortDescription || '',
        description: item.description || '',
        highlights: (item.highlights || []).join('\n'),
        includes: (item.includes || []).join('\n'),
        excludes: (item.excludes || []).join('\n'),
        isPopular: !!item.isPopular,
        status: item.status || 'active',
        seoTitle: item.seo?.metaTitle || '',
        seoDescription: item.seo?.metaDescription || '',
        vehiclePricing: (item.vehiclePricing || []).map((p) => ({
          vehicle: p.vehicle?._id || p.vehicle || '',
          price: p.price ?? '',
        })),
        itinerary: (item.itinerary || []).map((d) => ({
          day: d.day, title: d.title || '', description: d.description || '',
        })),
        image: null, // file input always starts empty
      };
    }
    return base;
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /* helpers for nested arrays */
  const addPricing = () => setForm((f) => ({ ...f, vehiclePricing: [...f.vehiclePricing, { vehicle: '', price: '' }] }));
  const updatePricing = (i, k, v) => setForm((f) => ({
    ...f,
    vehiclePricing: f.vehiclePricing.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)),
  }));
  const removePricing = (i) => setForm((f) => ({ ...f, vehiclePricing: f.vehiclePricing.filter((_, idx) => idx !== i) }));

  const addItinerary = () => setForm((f) => ({
    ...f,
    itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: '', description: '' }],
  }));
  const updateItinerary = (i, k, v) => setForm((f) => ({
    ...f,
    itinerary: f.itinerary.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)),
  }));
  const removeItinerary = (i) => setForm((f) => ({
    ...f,
    itinerary: f.itinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })),
  }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      // Validate vehicle pricing
      const pricing = form.vehiclePricing
        .filter((p) => p.vehicle && p.price !== '' && Number(p.price) > 0)
        .map((p) => ({ vehicle: p.vehicle, price: Number(p.price) }));

      const itinerary = form.itinerary
        .filter((d) => d.title)
        .map((d, i) => ({ day: Number(d.day) || i + 1, title: d.title, description: d.description }));

      const splitLines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

      const seo = {};
      if (form.seoTitle) seo.metaTitle = form.seoTitle;
      if (form.seoDescription) seo.metaDescription = form.seoDescription;

      const payload = {
        title: form.title,
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        durationDays: Number(form.durationDays) || 1,
        durationNights: Number(form.durationNights) || 0,
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        highlights: splitLines(form.highlights),
        includes: splitLines(form.includes),
        excludes: splitLines(form.excludes),
        isPopular: !!form.isPopular,
        status: form.status,
        vehiclePricing: pricing,
        itinerary,
      };
      if (Object.keys(seo).length) payload.seo = seo;

      // If a file is attached, send as multipart form-data
      let body, isForm = false;
      if (form.image instanceof File) {
        body = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === 'object') body.append(k, JSON.stringify(v));
          else body.append(k, v);
        });
        body.append('image', form.image);
        isForm = true;
      } else {
        body = payload;
      }

      if (mode === 'create') {
        await api('/tours', { method: 'POST', body, isForm });
      } else {
        await api(`/tours/${item._id}`, { method: 'PATCH', body, isForm });
      }
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-7 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold capitalize">{mode} tour</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        {/* Basics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Tour title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Golden Triangle 4N/5D" />
          </div>
          <div>
            <label className="label">From *</label>
            <input className="input" value={form.fromLocation} onChange={(e) => setForm({ ...form, fromLocation: e.target.value })} placeholder="Delhi" />
          </div>
          <div>
            <label className="label">To *</label>
            <input className="input" value={form.toLocation} onChange={(e) => setForm({ ...form, toLocation: e.target.value })} placeholder="Agra &amp; Jaipur" />
          </div>
          <div>
            <label className="label">Duration (days) *</label>
            <input className="input" type="number" min="1" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} />
          </div>
          <div>
            <label className="label">Duration (nights)</label>
            <input className="input" type="number" min="0" value={form.durationNights} onChange={(e) => setForm({ ...form, durationNights: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['oneDay', 'weekend', 'holiday', 'honeymoon', 'pilgrimage', 'adventure', 'family', 'custom'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <input className="input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="1-2 line teaser shown on listings" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Full description</label>
            <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell guests what to expect on this tour" />
          </div>
          <div>
            <label className="label">Tour image</label>
            <input
              type="file"
              accept="image/*"
              className="input !py-2.5"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
            {mode === 'edit' && item?.image?.url && (
              <p className="mt-1 text-[11px] text-slate-400">Leave blank to keep the current image.</p>
            )}
          </div>
          <div>
            <label className="label">&nbsp;</label>
            <label className="flex h-[46px] cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 accent-amber-500"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
              />
              Show in popular tours
            </label>
          </div>
        </div>

        {/* Vehicle pricing — THE key new feature */}
        <div className="mt-6 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Vehicle pricing *</p>
              <p className="mt-0.5 text-xs text-slate-500">Set a flat package price for each car you want to offer. Customers see one price per car.</p>
            </div>
            <button className="text-xs font-bold text-amber-600 hover:underline" onClick={addPricing}>
              + Add vehicle
            </button>
          </div>
          {form.vehiclePricing.length === 0 && (
            <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-xs text-slate-500">
              Add at least one vehicle so customers can book this tour.
            </p>
          )}
          {form.vehiclePricing.map((p, i) => (
            <div key={i} className="mt-3 grid items-end gap-2 rounded-lg bg-mist p-3 sm:grid-cols-[2fr,1fr,auto]">
              <div>
                <label className="label">Vehicle</label>
                <select
                  className="input !py-2"
                  value={p.vehicle}
                  onChange={(e) => updatePricing(i, 'vehicle', e.target.value)}
                >
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.category} · {v.seatingCapacity}+1)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Package price (₹)</label>
                <input
                  className="input !py-2"
                  type="number"
                  min="0"
                  value={p.price}
                  onChange={(e) => updatePricing(i, 'price', e.target.value)}
                  placeholder="e.g. 18000"
                />
              </div>
              <button
                className="mb-1 grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                onClick={() => removePricing(i)}
                title="Remove"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Itinerary */}
        <div className="mt-4 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Day-by-day itinerary</p>
            <button className="text-xs font-bold text-amber-600 hover:underline" onClick={addItinerary}>
              + Add day
            </button>
          </div>
          {form.itinerary.map((d, i) => (
            <div key={i} className="mt-3 grid items-start gap-2 rounded-lg bg-mist p-3 sm:grid-cols-[60px,1fr,auto]">
              <div>
                <label className="label">Day</label>
                <input
                  className="input !py-2"
                  type="number"
                  min="1"
                  value={d.day}
                  onChange={(e) => updateItinerary(i, 'day', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Title &amp; details</label>
                <input
                  className="input !py-2"
                  value={d.title}
                  onChange={(e) => updateItinerary(i, 'title', e.target.value)}
                  placeholder="Arrival in Jaipur, city sightseeing"
                />
                <textarea
                  className="input !py-2 mt-2"
                  rows={2}
                  value={d.description}
                  onChange={(e) => updateItinerary(i, 'description', e.target.value)}
                  placeholder="What happens on this day…"
                />
              </div>
              <button
                className="mt-7 grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                onClick={() => removeItinerary(i)}
                title="Remove"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Bullet lists */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Highlights</label>
            <textarea
              className="input"
              rows={4}
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              placeholder="One per line"
            />
            <p className="mt-1 text-[11px] text-slate-400">One bullet point per line.</p>
          </div>
          <div>
            <label className="label">Includes</label>
            <textarea
              className="input"
              rows={4}
              value={form.includes}
              onChange={(e) => setForm({ ...form, includes: e.target.value })}
              placeholder="Hotels, breakfast, driver…"
            />
            <p className="mt-1 text-[11px] text-slate-400">One per line.</p>
          </div>
          <div>
            <label className="label">Excludes</label>
            <textarea
              className="input"
              rows={4}
              value={form.excludes}
              onChange={(e) => setForm({ ...form, excludes: e.target.value })}
              placeholder="Air fare, entry tickets…"
            />
            <p className="mt-1 text-[11px] text-slate-400">One per line.</p>
          </div>
        </div>

        {/* SEO */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">SEO meta title</label>
            <input className="input" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          </div>
          <div>
            <label className="label">SEO meta description</label>
            <input className="input" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save tour'}
          </button>
        </div>
      </div>
    </div>
  );
}
