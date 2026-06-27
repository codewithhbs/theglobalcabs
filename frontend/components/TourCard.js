import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './Icons';

export default function TourCard({ tour }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-44 bg-ink">
        {tour.image?.url ? (
          <Image
            src={tour.image.url}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-amber-500">
            <Icon name="pin" className="h-10 w-10 opacity-40" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
          {tour.category}
        </span>
        {tour.isPopular && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-400">
            ★ Popular
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-extrabold leading-tight text-ink line-clamp-2">{tour.title}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Icon name="pin" className="h-3.5 w-3.5" />
          {tour.fromLocation} → {tour.toLocation}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Icon name="clock" className="h-4 w-4" />
            {tour.durationDays}D{tour.durationNights ? `/${tour.durationNights}N` : ''}
          </span>
          {tour.startingPrice > 0 ? (
            <span className="font-display text-base font-extrabold text-amber-600">
              ₹{tour.startingPrice.toLocaleString('en-IN')}
              <span className="ml-1 text-[10px] font-semibold text-slate-400">onwards</span>
            </span>
          ) : (
            <span className="font-semibold text-amber-600 group-hover:underline">View tour →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
