import { Icon } from '@/components/Icons';

export function StatCard({ label, value, icon, sub }) {
  return (
    <div className="card flex items-start justify-between p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      {icon && (
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
          <Icon name={icon} className="h-5 w-5" />
        </span>
      )}
    </div>
  );
}

const STATUS = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  ongoing: 'bg-violet-50 text-violet-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-slate-100 text-slate-500',
  new: 'bg-amber-50 text-amber-700',
  inProgress: 'bg-blue-50 text-blue-700',
  read: 'bg-blue-50 text-blue-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  available: 'bg-emerald-50 text-emerald-700',
  onTrip: 'bg-violet-50 text-violet-700',
  offDuty: 'bg-slate-100 text-slate-500',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS[status] || 'bg-mist text-slate-500'}`}>
      {status}
    </span>
  );
}
