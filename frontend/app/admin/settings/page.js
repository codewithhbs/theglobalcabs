'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const [form, setForm] = useState(null);
  const [logo, setLogo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ ok: '', err: '' });

  useEffect(() => {
    api('/settings').then((r) => {
      const s = r.data;
      setForm({
        companyName: s.companyName || '',
        tagline: s.tagline || '',
        phone: s.phone || '',
        altPhone: s.altPhone || '',
        whatsapp: s.whatsapp || '',
        email: s.email || '',
        address: s.address || '',
        workingHours: s.workingHours || '',
        announcement: s.announcement || '',
        taxPercent: s.taxPercent ?? 5,
        cancellationWindowHours: s.cancellationWindowHours ?? 4,
        peakHours: s.peakHours || { active: false, start: '22:00', end: '06:00', percent: 10 },
        social: s.social || { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
      });
    }).catch((e) => setMsg({ ok: '', err: e.message }));
  }, []);

  const save = async () => {
    setBusy(true);
    setMsg({ ok: '', err: '' });
    try {
      const body = {
        ...form,
        taxPercent: Number(form.taxPercent),
        cancellationWindowHours: Number(form.cancellationWindowHours),
        peakHours: { ...form.peakHours, percent: Number(form.peakHours.percent) || 0 },
      };
      let payload = body;
      let isForm = false;
      if (logo) {
        isForm = true;
        payload = new FormData();
        Object.entries(body).forEach(([k, v]) => {
          payload.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
        });
        payload.append('logo', logo);
      }
      await api('/settings', { method: 'PATCH', body: payload, isForm });
      setMsg({ ok: 'Settings saved.', err: '' });
    } catch (e) {
      setMsg({ ok: '', err: e.message });
    }
    setBusy(false);
  };

  if (!form) return <p className="text-sm text-slate-400">Loading settings…</p>;

  const input = (label, key, type = 'text', half = true) => (
    <div className={half ? '' : 'sm:col-span-2'}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Company info, taxes, peak hours and policies — used across the website, invoices and notifications.</p>

      <div className="card mt-6 p-7">
        <h2 className="font-display font-extrabold">Company</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {input('Company name', 'companyName')}
          {input('Tagline', 'tagline')}
          {input('Phone', 'phone')}
          {input('Alternate phone', 'altPhone')}
          {input('WhatsApp number', 'whatsapp')}
          {input('Email', 'email', 'email')}
          {input('Address', 'address', 'text', false)}
          {input('Working hours', 'workingHours')}
          <div>
            <label className="label">Logo</label>
            <input type="file" accept="image/*" className="input !py-2.5" onChange={(e) => setLogo(e.target.files[0] || null)} />
          </div>
          {input('Announcement (top bar)', 'announcement', 'text', false)}
        </div>
      </div>

      <div className="card mt-5 p-7">
        <h2 className="font-display font-extrabold">Pricing & policies</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {input('Tax (%)', 'taxPercent', 'number')}
          {input('Free cancellation window (hours before pickup)', 'cancellationWindowHours', 'number')}
        </div>

        <div className="mt-5 rounded-xl border border-slate-100 p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
            <input type="checkbox" className="h-4 w-4 accent-amber-500" checked={form.peakHours.active} onChange={(e) => setForm({ ...form, peakHours: { ...form.peakHours, active: e.target.checked } })} />
            Global peak-hour surcharge (applies when no rule-level peak pricing is set)
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
      </div>

      <div className="card mt-5 p-7">
        <h2 className="font-display font-extrabold">Social links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((k) => (
            <div key={k}>
              <label className="label capitalize">{k}</label>
              <input className="input" value={form.social[k] || ''} onChange={(e) => setForm({ ...form, social: { ...form.social, [k]: e.target.value } })} placeholder={`https://${k}.com/…`} />
            </div>
          ))}
        </div>
      </div>

      {msg.err && <p className="mt-4 text-sm font-semibold text-red-600">{msg.err}</p>}
      {msg.ok && <p className="mt-4 text-sm font-semibold text-emerald-600">{msg.ok}</p>}

      <button className="btn-primary mt-5" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
    </div>
  );
}
