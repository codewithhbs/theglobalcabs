import { Icon } from './Icons';

// Signature element: pickup ●····· drop, like lane markings on a map
export default function RouteLine({ from, to, className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="flex items-center gap-1.5 font-semibold text-ink">
        <span className="h-2.5 w-2.5 rounded-full border-[3px] border-amber-500" />
        {from}
      </span>
      <span className="route-dots h-1 min-w-6 flex-1" />
      <span className="flex items-center gap-1.5 font-semibold text-ink">
        <Icon name="pin" className="h-4 w-4 text-amber-600" />
        {to}
      </span>
    </div>
  );
}
