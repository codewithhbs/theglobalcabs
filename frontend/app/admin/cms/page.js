'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/Shared';

export default function AdminCmsPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/cms/pages?limit=200&sort=-updatedAt');
      setPages(res.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (page) => {
    if (!confirm(`Delete "${page.title}"?`)) return;
    try { await api(`/cms/pages/${page._id}`, { method: 'DELETE' }); load(); } catch (e) { alert(e.message); }
  };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? pages.filter((p) => p.title.toLowerCase().includes(t) || p.slug.includes(t)) : pages;
  }, [pages, q]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">CMS Pages</h1>
          <p className="mt-1 text-sm text-slate-500">About, policies, FAQ, SEO landing pages — editable without code.</p>
        </div>
        <Link href="/admin/cms/new" className="btn-primary !px-4 !py-2 text-sm">+ Add new page</Link>
      </div>

      <input className="input mt-5 max-w-sm" placeholder="Search title or slug…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-bold">Title</th>
              <th className="px-5 py-3.5 font-bold">Slug</th>
              <th className="px-5 py-3.5 font-bold">SEO</th>
              <th className="px-5 py-3.5 font-bold">FAQs</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 font-bold">Updated</th>
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && list.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No pages found.</td></tr>}
            {list.map((p) => {
              const seoOk = !!(p.seo?.metaTitle && p.seo?.metaDescription);
              return (
                <tr key={p._id} className="hover:bg-mist/60">
                  <td className="max-w-xs px-5 py-3.5 font-bold">{p.title}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">/{p.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${seoOk ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{seoOk ? 'Set' : 'Missing'}</span>
                  </td>
                  <td className="px-5 py-3.5">{p.faqs?.length || 0}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(p.updatedAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex gap-2">
                      {p.status === 'active' && <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600">View</a>}
                      <Link href={`/admin/cms/${p._id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600">Edit</Link>
                      <button className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50" onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
