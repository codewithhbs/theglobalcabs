import Link from 'next/link';
import Image from 'next/image';
import RouteLine from './RouteLine';
import { Icon } from './Icons';

export default function RouteCard({ route }) {
  return (
    <Link href={`/routes/${route.slug}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-40 bg-ink">
        {route.image?.url ? (
          <Image src={route.image.url} alt={route.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-amber-500"><Icon name="pin" className="h-10 w-10 opacity-40" /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
          {route.category}
        </span>
      </div>
      <div className="p-5">
        <RouteLine from={route.pickupLocation} to={route.dropLocation} />
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1"><Icon name="car" className="h-4 w-4" /> {route.distanceKm} km</span>
          <span className="flex items-center gap-1"><Icon name="clock" className="h-4 w-4" /> {route.estimatedTime}</span>
          <span className="font-semibold text-amber-600 group-hover:underline">View fares →</span>
        </div>
      </div>
    </Link>
  );
}
