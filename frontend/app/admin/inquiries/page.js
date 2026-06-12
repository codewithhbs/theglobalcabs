'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/Shared';
import { Icon } from '@/components/Icons';

const STATUSES = ['new', 'inProgress', 'resolved'];

export default function AdminInquiriesPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/contact?limit=300&sort=-createdAt');
      setItems(res.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const remove = async (item) => {
    if (!confirm('Delete this inquiry?')) return;
    try { await api(`/contact/${item._id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Contact Inquiries</h1>
      <p className="mt-1 text-sm text-slate-500">Messages from the website contact form.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {['all', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${filter === s ? 'bg-ink text-amber-400' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
            {s === 'inProgress' ? 'In progress' : s}
          </button>
        ))}
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-bold">From</th>
              <th className="px-5 py-3.5 font-bold">Subject</th>
              <th className="px-5 py-3.5 font-bold">Message</th>
              <th className="px-5 py-3.5 font-bold">Received</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No inquiries.</td></tr>}
            {filtered.map((q) => (
              <tr key={q._id} className="hover:bg-mist/60">
                <td className="px-5 py-3.5">
                  <p className="font-semibold">{q.name}</p>
                  <p className="text-xs text-slate-400">{q.phone} {q.email && `· ${q.email}`}</p>
                </td>
                <td className="px-5 py-3.5">{q.subject || '—'}</td>
                <td className="max-w-[260px] px-5 py-3.5"><span className="block truncate text-xs text-slate-500">{q.message}</span></td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(q.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-5 py-3.5"><StatusBadge status={q.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600" onClick={() => setSelected(q)}>Open</button>
                    <button className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50" onClick={() => remove(q)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <InquiryModal inquiry={selected} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function InquiryModal({ inquiry, onClose, onSaved }) {
  const [status, setStatus] = useState(inquiry.status);
  const [adminNote, setAdminNote] = useState(inquiry.adminNote || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api(`/contact/${inquiry._id}`, { method: 'PATCH', body: { status, adminNote } });
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Inquiry from {inquiry.name}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Icon name="x" className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 rounded-xl bg-mist p-4 text-sm">
          <p className="text-xs text-slate-400">{inquiry.phone} {inquiry.email && `· ${inquiry.email}`} · {new Date(inquiry.createdAt).toLocaleString('en-IN')}</p>
          {inquiry.subject && <p className="mt-2 font-bold">{inquiry.subject}</p>}
          <p className="mt-2 whitespace-pre-wrap text-slate-600">{inquiry.message}</p>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'inProgress' ? 'In progress' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Admin note</label>
            <textarea className="input" rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          {inquiry.phone && <a className="btn-ghost !px-4 !py-2 text-sm" href={`tel:${inquiry.phone}`}><Icon name="phone" className="h-4 w-4" /> Call</a>}
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
