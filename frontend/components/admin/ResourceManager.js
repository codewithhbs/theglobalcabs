'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Icon } from '@/components/Icons';

/**
 * Config-driven CRUD manager used by most admin modules.
 *
 * config = {
 *   endpoint: '/routes',
 *   title: 'Routes',
 *   singular: 'route',
 *   searchKeys: ['name'],            // client-side search across these keys
 *   columns: [{ key, label, render? }],
 *   fields: [{ name, label, type: 'text'|'textarea'|'number'|'select'|'checkbox'|'date'|'file'|'files'|'tags', options?, required?, half?, accept?, hint?, rows? }],
 *   toForm?: (item) => values        // map API item -> form values when editing
 *   readOnly?: boolean               // hide create/edit/delete
 * }
 */
export default function ResourceManager({ config, transformBody, extraActions }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', item }
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`${config.endpoint}?limit=200&sort=-createdAt`);
      setItems(res.data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [config.endpoint]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((it) =>
      (config.searchKeys || ['name']).some((k) => String(k.split('.').reduce((o, p) => o?.[p], it) ?? '').toLowerCase().includes(q))
    );
  }, [items, search, config.searchKeys]);

  const remove = async (item) => {
    if (!confirm(`Delete this ${config.singular}? This cannot be undone.`)) return;
    try {
      await api(`${config.endpoint}/${item._id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">{config.title}</h1>
          {config.subtitle && <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {extraActions}
          {!config.readOnly && (
            <button className="btn-primary !px-4 !py-2 text-sm" onClick={() => setModal({ mode: 'create' })}>
              + New {config.singular}
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input className="input max-w-xs" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="text-xs text-slate-400">{filtered.length} of {items.length}</span>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              {config.columns.map((c) => <th key={c.key} className="px-5 py-3.5 font-bold">{c.label}</th>)}
              <th className="px-5 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && <tr><td colSpan={config.columns.length + 1} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={config.columns.length + 1} className="px-5 py-8 text-center text-slate-400">Nothing here yet.</td></tr>}
            {filtered.map((item) => (
              <tr key={item._id} className="hover:bg-mist/60">
                {config.columns.map((c) => (
                  <td key={c.key} className="px-5 py-3.5 align-middle">
                    {c.render ? c.render(item, load) : String(c.key.split('.').reduce((o, p) => o?.[p], item) ?? '—')}
                  </td>
                ))}
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex gap-2">
                    {!config.readOnly && (
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:border-amber-400 hover:text-amber-600" onClick={() => setModal({ mode: 'edit', item })}>Edit</button>
                    )}
                    {!config.noDelete && (
                      <button className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50" onClick={() => remove(item)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <ResourceModal
          config={config}
          mode={modal.mode}
          item={modal.item}
          transformBody={transformBody}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}

function ResourceModal({ config, mode, item, transformBody, onClose, onSaved }) {
  const initial = useMemo(() => {
    const base = {};
    config.fields.forEach((f) => {
      if (f.type === 'checkbox') base[f.name] = false;
      else if (f.type === 'file' || f.type === 'files') base[f.name] = null;
      else base[f.name] = '';
    });
    if (mode === 'edit' && item) {
      const mapped = config.toForm ? config.toForm(item) : item;
      config.fields.forEach((f) => {
        if (f.type === 'file' || f.type === 'files') return;
        const v = f.name.split('.').reduce((o, p) => o?.[p], mapped);
        if (v !== undefined && v !== null) base[f.name] = f.type === 'tags' && Array.isArray(v) ? v.join(', ') : v;
      });
    }
    return base;
  }, [config, mode, item]);

  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const hasFiles = config.fields.some((f) => (f.type === 'file' || f.type === 'files') && values[f.name]);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      let body;
      const prepared = { ...values };
      config.fields.forEach((f) => {
        if (f.type === 'tags' && typeof prepared[f.name] === 'string') {
          prepared[f.name] = prepared[f.name].split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (f.type === 'number' && prepared[f.name] !== '') prepared[f.name] = Number(prepared[f.name]);
        if (prepared[f.name] === '' && !f.sendEmpty) delete prepared[f.name];
      });
      const finalBody = transformBody ? transformBody(prepared, mode, item) : prepared;

      if (hasFiles) {
        body = new FormData();
        Object.entries(finalBody).forEach(([k, v]) => {
          if (v === null || v === undefined) return;
          const field = config.fields.find((f) => f.name === k);
          if (field?.type === 'files' && v instanceof FileList) {
            Array.from(v).forEach((file) => body.append(k, file));
          } else if (field?.type === 'file' && v instanceof File) {
            body.append(k, v);
          } else if (typeof v === 'object' && !(v instanceof File)) {
            body.append(k, JSON.stringify(v));
          } else {
            body.append(k, v);
          }
        });
      } else {
        body = finalBody;
        config.fields.forEach((f) => {
          if (f.type === 'file' || f.type === 'files') delete body[f.name];
        });
      }

      if (mode === 'create') {
        await api(config.endpoint, { method: 'POST', body, isForm: hasFiles });
      } else {
        await api(`${config.endpoint}/${item._id}`, { method: 'PATCH', body, isForm: hasFiles });
      }
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
          <h2 className="font-display text-xl font-extrabold capitalize">{mode} {config.singular}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-mist"><Icon name="x" className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
              <label className="label">{f.label}{f.required && ' *'}</label>
              {f.type === 'textarea' && (
                <textarea className="input" rows={f.rows || 4} value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} placeholder={f.placeholder} />
              )}
              {f.type === 'select' && (
                <select className="input" value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}>
                  <option value="">Select…</option>
                  {(f.options || []).map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                </select>
              )}
              {f.type === 'checkbox' && (
                <label className="flex h-[46px] cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                  <input type="checkbox" className="h-4 w-4 accent-amber-500" checked={!!values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })} />
                  {f.hint || 'Yes'}
                </label>
              )}
              {f.type === 'file' && (
                <input type="file" accept={f.accept || 'image/*'} className="input !py-2.5" onChange={(e) => setValues({ ...values, [f.name]: e.target.files[0] || null })} />
              )}
              {f.type === 'files' && (
                <input type="file" accept={f.accept || 'image/*'} multiple className="input !py-2.5" onChange={(e) => setValues({ ...values, [f.name]: e.target.files })} />
              )}
              {['text', 'number', 'date', 'time', 'email', 'password', 'tags'].includes(f.type) && (
                <input
                  className="input"
                  type={f.type === 'tags' ? 'text' : f.type}
                  value={values[f.name]}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  placeholder={f.type === 'tags' ? 'comma, separated, values' : f.placeholder}
                />
              )}
              {f.hint && f.type !== 'checkbox' && <p className="mt-1 text-[11px] text-slate-400">{f.hint}</p>}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
