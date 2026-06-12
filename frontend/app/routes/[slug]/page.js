import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import RouteLine from '@/components/RouteLine';
import { Icon } from '@/components/Icons';
import { getRouteDetail, getPopularRoutes } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import RouteCard from '@/components/RouteCard';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getRouteDetail(slug);
  if (!data?.route) return {};
  const r = data.route;
  return buildMetadata(`/routes/${slug}`, {
    title: r.seo?.metaTitle || `${r.pickupLocation} to ${r.dropLocation} Cab — Fixed Fare | Global Cabs`,
    description: r.seo?.metaDescription || `Book a cab from ${r.pickupLocation} to ${r.dropLocation} (${r.distanceKm} km, approx ${r.estimatedTime}). Fixed fares for all car types, 24x7 availability.`,
  });
}

export default async function RouteDetailPage({ params }) {
  const { slug } = await params;
  const [data, popular] = await Promise.all([getRouteDetail(slug), getPopularRoutes()]);
  if (!data?.route) notFound();
  const { route, fares } = data;

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-amber-400">{route.category} route</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {route.pickupLocation} <span className="text-amber-400">→</span> {route.dropLocation}
            </h1>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2"><Icon name="car" className="h-4 w-4 text-amber-400" /> {route.distanceKm} km</span>
              <span className="flex items-center gap-2"><Icon name="clock" className="h-4 w-4 text-amber-400" /> approx {route.estimatedTime}</span>
              <span className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-amber-400" /> Fixed fare, all-inclusive</span>
            </div>
            {route.description && <p className="mt-6 max-w-lg leading-relaxed text-slate-300">{route.description}</p>}

            {/* Fare table */}
            <div className="mt-10 overflow-hidden rounded-2xl bg-white/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Cab</th>
                    <th className="px-5 py-3">Seats</th>
                    <th className="px-5 py-3 text-right">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fares.map((f) => (
                    <tr key={f._id}>
                      <td className="px-5 py-3.5 font-semibold">{f.vehicle?.name}</td>
                      <td className="px-5 py-3.5 text-slate-400">{f.vehicle?.seatingCapacity}+1</td>
                      <td className="px-5 py-3.5 text-right font-display font-extrabold text-amber-400">
                        {f.fareType === 'fixed' ? `₹${f.fixedFare}` : `₹${f.perKmRate || f.vehicle?.perKmRate}/km`}
                      </td>
                    </tr>
                  ))}
                  {fares.length === 0 && (
                    <tr><td colSpan={3} className="px-5 py-4 text-slate-400">Fares for this route are available on call — or use the booking form for an instant quote.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">Fares include fuel & driver charges. Tolls/parking extra as per actuals. Taxes shown at checkout.</p>

            {route.image?.url && (
              <div className="relative mt-8 h-56 overflow-hidden rounded-2xl">
                <Image src={route.image.url} alt={route.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            )}
          </div>
          <div className="lg:justify-self-end">
            <BookingForm preselect={{ routeId: route._id, tripType: route.category === 'roundTrip' ? 'roundTrip' : route.category === 'local' ? 'local' : route.category === 'airport' ? 'airport' : route.category === 'railway' ? 'railway' : 'oneWay' }} />
          </div>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Other popular routes</h2>
            <Link href="/routes" className="btn-ghost">All routes →</Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popular.filter((r) => r.slug !== slug).slice(0, 4).map((r) => <RouteCard key={r._id} route={r} />)}
          </div>
        </div>
      </section>
    </>
  );
}
