'use client';
import { useState } from 'react';

export default function FaqAccordion({ faqs = [] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-card">
      {faqs.map((f, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-ink"
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
          >
            {f.question}
            <span className={`text-amber-600 transition ${open === i ? 'rotate-45' : ''}`} aria-hidden>+</span>
          </button>
          {open === i && <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500">{f.answer}</p>}
        </div>
      ))}
    </div>
  );
}
