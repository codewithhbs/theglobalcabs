import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TourBookingForm from '@/components/TourBookingForm';
import TourCard from '@/components/TourCard';
import { Icon } from '@/components/Icons';
import { getTour, getPopularTours } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) return {};
  return buildMetadata(`/tours/${slug}`, {
    title: tour.seo?.metaTitle || `${tour.title} — ${tour.durationDays}D Tour Package | Global Cabs`,
    description:
      tour.seo?.metaDescription ||
      tour.shortDescription ||
      `Book the ${tour.title} tour from ${tour.fromLocation} to ${tour.toLocation}. Choose your car, pay one all-inclusive package price.`,
  });
}

export default async function TourDetailPage({ params }) {
  const { slug } = await params;
  const [tour, popular] = await Promise.all([getTour(slug), getPopularTours()]);
  if (!tour) notFound();

  return (
    <>
      {/* HERO */}
      <section className="bg-ink py-16 text-white">
        <div className="container-gc grid items-start gap-12 lg:grid-cols-[1.2fr,1fr]">
          <div>
            <p className="eyebrow text-amber-400">{tour.category} tour</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {tour.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <Icon name="pin" className="h-4 w-4 text-amber-400" />
                {tour.fromLocation} → {tour.toLocation}
              </span>
              <span className="flex items-center gap-2">
                <Icon name="clock" className="h-4 w-4 text-amber-400" />
                {tour.durationDays}D{tour.durationNights ? `/${tour.durationNights}N` : ''}
              </span>
              {tour.startingPrice > 0 && (
                <span className="flex items-center gap-2">
                  <Icon name="rupee" className="h-4 w-4 text-amber-400" />
                  Starting ₹{tour.startingPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {tour.shortDescription && (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200">
                {tour.shortDescription}
              </p>
            )}

            {tour.image?.url && (
              <div className="relative mt-8 h-72 overflow-hidden rounded-2xl">
                <Image
                  src={tour.image.url}
                  alt={tour.title}
                  fill
                  sizes="(max-width:1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="lg:justify-self-end lg:sticky lg:top-24">
            <TourBookingForm tour={tour} />
          </div>
        </div>
        <div className="lane mt-12" />
      </section>

      {/* DETAILS */}
      <section className="py-16">
        <div className="container-gc grid gap-12 lg:grid-cols-[1.4fr,1fr]">
          <div>
            {/* Highlights */}
            {Array.isArray(tour.highlights) && tour.highlights.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Tour Highlights</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {tour.description && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-extrabold tracking-tight">About this tour</h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{tour.description}</p>
              </div>
            )}

            {/* Itinerary */}
            {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Day-by-day Itinerary</h2>
                <ol className="mt-5 space-y-4">
                  {tour.itinerary.map((d, i) => (
                    <li key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-extrabold text-amber-400">
                          {d.day}
                        </span>
                        <h3 className="font-display text-base font-bold text-ink">{d.title}</h3>
                      </div>
                      {d.description && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{d.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Vehicles & pricing table */}
            {Array.isArray(tour.vehiclePricing) && tour.vehiclePricing.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Choose your car &amp; price</h2>
                <p className="mt-2 text-sm text-slate-500">Each car has its own package price. Pick the one that fits your group size and budget.</p>
                <div className="card mt-5 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5 font-bold">Car</th>
                        <th className="px-5 py-3.5 font-bold">Category</th>
                        <th className="px-5 py-3.5 font-bold">Seats</th>
                        <th className="px-5 py-3.5 text-right font-bold">Package price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tour.vehiclePricing
                        .filter((p) => p.vehicle)
                        .map((p) => (
                          <tr key={p.vehicle._id}>
                            <td className="px-5 py-3.5 font-semibold text-ink">{p.vehicle.name}</td>
                            <td className="px-5 py-3.5 text-slate-500">{p.vehicle.category}</td>
                            <td className="px-5 py-3.5 text-slate-500">{p.vehicle.seatingCapacity}+1</td>
                            <td className="px-5 py-3.5 text-right font-display font-extrabold text-amber-600">
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-400">Prices are all-inclusive (driver, fuel, taxes shown at checkout). Tolls/parking & monument entry fees extra unless specified.</p>
              </div>
            )}
          </div>

          {/* Includes / Excludes sidebar */}
          <aside className="space-y-6">
            {Array.isArray(tour.includes) && tour.includes.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-base font-extrabold text-ink">What&apos;s included</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {tour.includes.map((it, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-slate-700">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-green-100 text-green-600">
                        <Icon name="check" className="h-2.5 w-2.5" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(tour.excludes) && tour.excludes.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-base font-extrabold text-ink">Not included</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {tour.excludes.map((it, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-slate-700">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                        <Icon name="x" className="h-2.5 w-2.5" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Related */}
      {popular.length > 0 && (
        <section className="bg-mist py-16">
          <div className="container-gc">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Other popular tours</h2>
              <Link href="/tours" className="btn-ghost">All tours →</Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.filter((t) => t.slug !== slug).slice(0, 3).map((t) => <TourCard key={t._id} tour={t} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
