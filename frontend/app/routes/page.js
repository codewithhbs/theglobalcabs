import Link from 'next/link';
import RouteCard from '@/components/RouteCard';
import { getRoutes } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return buildMetadata('/routes', {
    title: 'Popular Cab Routes & Fixed Fares | Global Cabs Gurugram',
    description: 'Fixed-fare cab routes from Gurugram — IGI Airport, New Delhi Railway Station, Jaipur, Agra, Chandigarh, Haridwar and more.',
  });
}

const CATEGORY_LABELS = {
  all: 'All routes',
  airport: 'Airport',
  railway: 'Railway',
  outstation: 'Outstation',
  oneWay: 'One Way',
  roundTrip: 'Round Trip',
  local: 'Local',
};

export default async function RoutesPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category && CATEGORY_LABELS[sp.category] ? sp.category : 'all';
  const routes = await getRoutes();
  const filtered = category === 'all' ? routes : routes.filter((r) => r.category === category);
  const presentCats = ['all', ...new Set(routes.map((r) => r.category))];

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">Routes</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Fixed fares. No surge. Ever.</h1>
          <p className="mt-4 max-w-lg text-slate-300">Pick a route to see exact fares for every car category — or build your own trip with the fare calculator.</p>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc">
          <div className="flex flex-wrap gap-2">
            {presentCats.map((c) => (
              <Link
                key={c}
                href={c === 'all' ? '/routes' : `/routes?category=${c}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === c ? 'bg-ink text-amber-400' : 'bg-mist text-slate-600 hover:bg-slate-200'}`}
              >
                {CATEGORY_LABELS[c] || c}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((r) => <RouteCard key={r._id} route={r} />)}
          </div>
          {filtered.length === 0 && <p className="mt-10 text-slate-500">No routes in this category yet.</p>}

          <div className="mt-14 rounded-2xl bg-mist p-8 text-center">
            <h2 className="font-display text-xl font-bold">Don&apos;t see your destination?</h2>
            <p className="mt-2 text-sm text-slate-500">We cover 50+ cities. Use the fare calculator or call us for a custom quote.</p>
            <Link href="/fare-calculator" className="btn-primary mt-5">Open fare calculator</Link>
          </div>
        </div>
      </section>
    </>
  );
}
