import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './Icons';

export default function VehicleCard({ vehicle }) {
  return (
    <Link href={`/fleet/${vehicle.slug}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-44 bg-mist">
        {vehicle.images?.[0]?.url ? (
          <Image src={vehicle.images[0].url} alt={vehicle.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-slate-300"><Icon name="car" className="h-14 w-14" /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-400">{vehicle.category}</span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg font-bold">{vehicle.name}</h3>
          <p className="text-sm font-bold text-amber-600">₹{vehicle.perKmRate}<span className="text-xs font-medium text-slate-400">/km</span></p>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Icon name="users" className="h-4 w-4" /> {vehicle.seatingCapacity}+1 Seater</span>
          <span className="flex items-center gap-1"><Icon name="bag" className="h-4 w-4" /> {vehicle.luggageCapacity} Bags</span>
        </div>
      </div>
    </Link>
  );
}
