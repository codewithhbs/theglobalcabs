import { Icon } from './Icons';

export default function TestimonialCard({ t }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <div className="flex gap-0.5 text-amber-500">
        {Array.from({ length: t.rating || 5 }).map((_, i) => <Icon key={i} name="star" className="h-4 w-4 fill-amber-400" />)}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">“{t.message}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display font-bold text-amber-400">{t.name?.[0]}</span>
        <div>
          <p className="text-sm font-bold">{t.name}</p>
          <p className="text-xs text-slate-400">{t.designation}</p>
        </div>
      </figcaption>
    </figure>
  );
}
