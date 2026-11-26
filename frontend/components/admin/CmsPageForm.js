'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Icon } from '@/components/Icons';
import RichTextEditor from '@/components/admin/RichTextEditor';

const slugify = (s = '') => s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const stripTags = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// ---------- SEO analysis (runs live while editing) ----------
function analyse(f) {
  const kw = f.focusKeyword.trim().toLowerCase();
  const doc = new DOMParser().parseFromString(f.content || '', 'text/html');
  const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(' ').length : 0;
  const first100 = text.split(' ').slice(0, 100).join(' ').toLowerCase();
  const heads = [...doc.querySelectorAll('h2,h3,h4')].map((h) => h.textContent.toLowerCase());
  const imgs = [...doc.querySelectorAll('img')];
  const links = doc.querySelectorAll('a[href]').length;
  const count = kw ? lower.split(kw).length - 1 : 0;
  const title = (f.metaTitle || f.title).trim();
  const desc = f.metaDescription.trim();
  const checks = [
    ['Focus keyword set hai', !!kw],
    ['Keyword meta title me hai', !!kw && title.toLowerCase().includes(kw)],
    ['Keyword meta description me hai', !!kw && desc.toLowerCase().includes(kw)],
    ['Keyword page title (H1) me hai', !!kw && f.title.toLowerCase().includes(kw)],
    ['Keyword URL slug me hai', !!kw && f.slug.includes(slugify(kw))],
    ['Keyword shuru ke 100 words me hai', !!kw && first100.includes(kw)],
    ['Keyword kisi subheading (H2–H4) me hai', !!kw && heads.some((h) => h.includes(kw))],
    [`Keyword content me ${count} baar (2+ chahiye)`, count >= 2],
    [`Meta title length ${title.length} (30–60 best)`, title.length >= 30 && title.length <= 60],
    [`Meta description length ${desc.length} (120–160 best)`, desc.length >= 120 && desc.length <= 160],
    [`Content ${words} words (300+ chahiye)`, words >= 300],
    ['Kam se kam 1 link content me hai', links > 0],
    ['Saari images me alt text hai', imgs.every((i) => (i.getAttribute('alt') || '').trim())],
  ];
  return { checks, words };
}

function Counter({ len, min, max }) {
  const ok = len >= min && len <= max;
  return <span className={`text-[11px] font-bold ${len === 0 ? 'text-slate-300' : ok ? 'text-emerald-600' : 'text-amber-600'}`}>{len}/{max}</span>;
}

export default function CmsPageForm({ page = null }) {
  const router = useRouter();
  const isEdit = !!page;
  const s = page?.seo || {};
  const [form, setForm] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: page?.status || 'active',
    faqs: page?.faqs?.map(({ question, answer }) => ({ question, answer })) || [],
    metaTitle: s.metaTitle || '',
    metaDescription: s.metaDescription || '',
    focusKeyword: s.focusKeyword || '',
    keywords: (s.keywords || []).join(', '),
    canonical: s.canonical || '',
    noIndex: !!s.noIndex,
    ogTitle: s.ogTitle || '',
    ogDescription: s.ogDescription || '',
    ogImage: s.ogImage || '',
    schemaMarkup: s.schemaMarkup || '',
  });
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL || '');
  useEffect(() => { if (!origin) setOrigin(window.location.origin); }, [origin]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setTitle = (v) => setForm((f) => ({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v) }));
  const setFaq = (i, k, v) => setForm((f) => ({ ...f, faqs: f.faqs.map((q, idx) => (idx === i ? { ...q, [k]: v } : q)) }));

  const { checks, words } = useMemo(() => analyse(form), [form]);
  const passed = checks.filter(([, ok]) => ok).length;
  const host = origin.replace(/^https?:\/\//, '');
  const serpTitle = form.metaTitle || form.title || 'Page title';

  const save = async () => {
    setMsg({ ok: '', err: '' });
    if (!form.title.trim()) return setMsg({ ok: '', err: 'Title required hai.' });
    if (!stripTags(form.content) && !/<img/i.test(form.content)) return setMsg({ ok: '', err: 'Content khaali hai.' });
    if (form.schemaMarkup.trim()) {
      try { JSON.parse(form.schemaMarkup); } catch { return setMsg({ ok: '', err: 'Schema markup valid JSON nahi hai.' }); }
    }
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        content: form.content,
        status: form.status,
        faqs: form.faqs.filter((q) => q.question.trim() && q.answer.trim()),
        seo: {
          metaTitle: form.metaTitle.trim(),
          metaDescription: form.metaDescription.trim(),
          focusKeyword: form.focusKeyword.trim(),
          keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
          canonical: form.canonical.trim(),
          noIndex: form.noIndex,
          ogTitle: form.ogTitle.trim(),
          ogDescription: form.ogDescription.trim(),
          ogImage: form.ogImage.trim(),
          schemaMarkup: form.schemaMarkup.trim(),
        },
      };
      if (isEdit) {
        const res = await api(`/cms/pages/${page._id}`, { method: 'PATCH', body });
        set('slug', res.data.slug);
        setMsg({ ok: 'Saved ✓', err: '' });
      } else {
        const res = await api('/cms/pages', { method: 'POST', body });
        router.replace(`/admin/cms/${res.data._id}`);
        return;
      }
    } catch (e) {
      setMsg({ ok: '', err: e.message });
    }
    setBusy(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/cms" className="text-xs font-bold text-slate-400 hover:text-amber-600">← CMS Pages</Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold">{isEdit ? 'Edit page' : 'Add new page'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && form.status === 'active' && (
            <a href={`/${form.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-amber-600 hover:underline">View page ↗</a>
          )}
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Update page' : 'Publish page'}</button>
        </div>
      </div>
      {msg.err && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">{msg.err}</p>}
      {msg.ok && <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">{msg.ok}</p>}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr),400px]">
        {/* ---------- MAIN ---------- */}
        <div className="grid min-w-0 gap-5">
          <div className="card p-6">
            <label className="label">Page title (H1) *</label>
            <input className="input !text-base !font-bold" value={form.title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cab Service in Gurgaon – Reliable and Comfortable Rides" />
            <label className="label mt-4">URL slug</label>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
              <span className="shrink-0 bg-mist px-3 py-3 text-sm text-slate-400">{host || 'yoursite.com'}/</span>
              <input className="w-full px-3 py-3 font-mono text-sm focus:outline-none" value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} placeholder="auto-from-title" />
            </div>
          </div>

          <div>
            <p className="label">Content</p>
            <RichTextEditor value={form.content} onChange={(html) => set('content', html)} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-extrabold">FAQs</p>
                <p className="mt-0.5 text-xs text-slate-400">FAQ schema (rich results) auto banta hai. Content me <code className="rounded bg-mist px-1">[faqs]</code> likhne se FAQ usi jagah dikhega, warna content ke baad.</p>
              </div>
              <button className="text-xs font-bold text-amber-600 hover:underline" onClick={() => set('faqs', [...form.faqs, { question: '', answer: '' }])}>+ Add FAQ</button>
            </div>
            {form.faqs.map((q, i) => (
              <div key={i} className="mt-3 grid gap-2 rounded-lg bg-mist p-3">
                <div className="flex gap-2">
                  <input className="input !py-2" value={q.question} onChange={(e) => setFaq(i, 'question', e.target.value)} placeholder="Question" />
                  <button className="grid h-9 w-10 shrink-0 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50" onClick={() => set('faqs', form.faqs.filter((_, idx) => idx !== i))}>
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
                <textarea className="input !py-2" rows={2} value={q.answer} onChange={(e) => setFaq(i, 'answer', e.target.value)} placeholder="Answer" />
              </div>
            ))}
          </div>
        </div>

        {/* ---------- SIDEBAR ---------- */}
        <div className="grid min-w-0 gap-5 xl:sticky xl:top-24">
          <div className="card p-5">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active (live)</option>
              <option value="inactive">Inactive (hidden)</option>
            </select>
          </div>

          <div className="card p-5">
            <p className="font-display font-extrabold">SEO</p>

            {/* Google preview */}
            <div className="mt-3 rounded-xl border border-slate-100 bg-white p-4">
              <p className="truncate text-xs text-slate-500">{host || 'yoursite.com'} › {form.slug}</p>
              <p className="mt-0.5 line-clamp-2 text-lg leading-snug text-[#1a0dab]">{serpTitle}</p>
              <p className="mt-1 line-clamp-3 text-sm leading-snug text-slate-600">{form.metaDescription || 'Meta description yahan dikhega…'}</p>
            </div>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="label">Focus keyword</label>
                <input className="input" value={form.focusKeyword} onChange={(e) => set('focusKeyword', e.target.value)} placeholder="e.g. Taxi Service in Gurgaon" />
              </div>
              <div>
                <div className="flex items-center justify-between"><label className="label">Meta title</label><Counter len={(form.metaTitle || '').length} min={30} max={60} /></div>
                <input className="input" value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} placeholder={form.title} />
              </div>
              <div>
                <div className="flex items-center justify-between"><label className="label">Meta description</label><Counter len={form.metaDescription.length} min={120} max={160} /></div>
                <textarea className="input" rows={3} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
              </div>
              <div>
                <label className="label">Keywords <span className="normal-case text-slate-300">(comma separated)</span></label>
                <input className="input" value={form.keywords} onChange={(e) => set('keywords', e.target.value)} />
              </div>
            </div>

            <details className="mt-4 rounded-xl border border-slate-100 p-3">
              <summary className="cursor-pointer text-sm font-bold">Advanced SEO & social</summary>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="label">Canonical URL</label>
                  <input className="input" value={form.canonical} onChange={(e) => set('canonical', e.target.value)} placeholder="auto (page ka apna URL)" />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" className="h-4 w-4 accent-amber-500" checked={form.noIndex} onChange={(e) => set('noIndex', e.target.checked)} />
                  noindex (Google se hide karo)
                </label>
                <div>
                  <label className="label">OG title</label>
                  <input className="input" value={form.ogTitle} onChange={(e) => set('ogTitle', e.target.value)} placeholder="default: meta title" />
                </div>
                <div>
                  <label className="label">OG description</label>
                  <textarea className="input" rows={2} value={form.ogDescription} onChange={(e) => set('ogDescription', e.target.value)} placeholder="default: meta description" />
                </div>
                <div>
                  <label className="label">OG image URL</label>
                  <input className="input" value={form.ogImage} onChange={(e) => set('ogImage', e.target.value)} placeholder="https://…" />
                </div>
                <div>
                  <label className="label">Custom schema (JSON-LD)</label>
                  <textarea className="input font-mono !text-xs" rows={5} value={form.schemaMarkup} onChange={(e) => set('schemaMarkup', e.target.value)} placeholder='{"@context":"https://schema.org", ...}' />
                  <p className="mt-1 text-[11px] text-slate-400">Sirf JSON daalo, &lt;script&gt; tag nahi. FAQ schema alag se auto lagta hai.</p>
                </div>
              </div>
            </details>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="font-display font-extrabold">SEO checklist</p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${passed === checks.length ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{passed}/{checks.length}</span>
            </div>
            <ul className="mt-3 grid gap-2">
              {checks.map(([label, ok]) => (
                <li key={label} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{ok ? '✓' : '!'}</span>
                  <span className={ok ? 'text-slate-600' : 'font-semibold text-slate-800'}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <Link href="/admin/cms" className="btn-ghost">Back to list</Link>
        <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Update page' : 'Publish page'}</button>
      </div>
    </div>
  );
}
