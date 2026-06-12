'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/Shared';
import { Icon } from '@/components/Icons';

export default function AdminCmsPage() {
  const [pages, setPages] = useState([]);
  const [modal, setModal] = useState(null); // null | {} (new) | page (edit)
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/cms/pages?limit=100');
      setPages(res.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (page) => {
    if (!confirm(`Delete "${page.title}"?`)) return;
    try { await api(`/cms/pages/${page._id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">CMS Pages</h1>
          <p className="mt-1 text-sm text-slate-500">About, policies, FAQ and custom pages — editable without code.</p>
        </div>
        <button className="btn-primary !px-4 !py-2 text-sm" onClick={() => setModal({})}>+ New page</button>
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-bold">Title</th>
              <th className="px-5 py-3.5 font-bold">Slug</th>
              <th className="px-5 py-3.5 font-bold">FAQs</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 font-bold">Updated</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && pages.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No pages yet.</td></tr>}
            {pages.map((p) => (
              <tr key={p._id} className="hover:bg-mist/60">
                <td className="px-5 py-3.5 font-bold">{p.title}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-500">/{p.slug}</td>
                <td className="px-5 py-3.5">{p.faqs?.length || 0}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(p.updatedAt).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600" onClick={() => setModal(p)}>Edit</button>
                    <button className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50" onClick={() => remove(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <PageModal page={modal._id ? modal : null} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}

function PageModal({ page, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: page?.status || 'active',
    faqs: page?.faqs?.map(({ question, answer }) => ({ question, answer })) || [],
    metaTitle: page?.seo?.metaTitle || '',
    metaDescription: page?.seo?.metaDescription || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const setFaq = (i, k, v) => setForm((f) => ({ ...f, faqs: f.faqs.map((q, idx) => (idx === i ? { ...q, [k]: v } : q)) }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = {
        title: form.title,
        content: form.content,
        status: form.status,
        faqs: form.faqs.filter((q) => q.question && q.answer),
        seo: { metaTitle: form.metaTitle, metaDescription: form.metaDescription },
      };
      if (form.slug) body.slug = form.slug;
      if (page) await api(`/cms/pages/${page._id}`, { method: 'PATCH', body });
      else await api('/cms/pages', { method: 'POST', body });
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-7 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{page ? 'Edit' : 'New'} page</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Icon name="x" className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Slug</label>
            <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from title" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Content (HTML) *</label>
            <textarea className="input" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className="label">SEO meta title</label>
            <input className="input" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </div>
          <div>
            <label className="label">SEO meta description</label>
            <input className="input" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* FAQ editor */}
        <div className="mt-5 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">FAQs on this page</p>
            <button className="text-xs font-bold text-amber-600 hover:underline" onClick={() => setForm((f) => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))}>
              + Add FAQ
            </button>
          </div>
          {form.faqs.map((q, i) => (
            <div key={i} className="mt-3 grid gap-2 rounded-lg bg-mist p-3">
              <div className="flex gap-2">
                <input className="input !py-2" value={q.question} onChange={(e) => setFaq(i, 'question', e.target.value)} placeholder="Question" />
                <button className="grid h-9 w-10 shrink-0 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50" onClick={() => setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }))}>
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
              <textarea className="input !py-2" rows={2} value={q.answer} onChange={(e) => setFaq(i, 'answer', e.target.value)} placeholder="Answer" />
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
