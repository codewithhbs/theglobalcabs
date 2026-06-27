import Link from 'next/link';
import TourCard from '@/components/TourCard';
import { getTours } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return buildMetadata('/tours', {
    title: 'Holiday Tours & Travel Packages | Global Cabs',
    description:
      'Curated multi-day tour packages from Delhi NCR — Golden Triangle, Rajasthan, Himachal, hill stations and weekend getaways. Choose your car, pay one fixed package price.',
  });
}

const CATEGORY_LABELS = {
  all: 'All tours',
  oneDay: 'One Day',
  weekend: 'Weekend',
  holiday: 'Holiday',
  honeymoon: 'Honeymoon',
  pilgrimage: 'Pilgrimage',
  adventure: 'Adventure',
  family: 'Family',
  custom: 'Custom',
};

export default async function ToursPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category && CATEGORY_LABELS[sp.category] ? sp.category : 'all';
  const tours = await getTours();
  const filtered = category === 'all' ? tours : tours.filter((t) => t.category === category);
  const presentCats = ['all', ...Array.from(new Set(tours.map((t) => t.category)))];

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">Holiday tours</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Curated journeys. Pick your car. <span className="text-amber-400">One package price.</span>
          </h1>
          <p className="mt-4 max-w-lg text-slate-300">
            Multi-day tour packages with hand-picked itineraries — choose from sedans, MUVs or premium SUVs and the price updates instantly.
          </p>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc">
          <div className="flex flex-wrap gap-2">
            {presentCats.map((c) => (
              <Link
                key={c}
                href={c === 'all' ? '/tours' : `/tours?category=${c}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === c ? 'bg-ink text-amber-400' : 'bg-mist text-slate-600 hover:bg-slate-200'
                }`}
              >
                {CATEGORY_LABELS[c] || c}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => <TourCard key={t._id} tour={t} />)}
          </div>
          {filtered.length === 0 && (
            <div className="mt-12 rounded-2xl bg-mist p-10 text-center">
              <h2 className="font-display text-xl font-bold">No tours in this category yet</h2>
              <p className="mt-2 text-sm text-slate-500">Check back soon — we&apos;re adding new packages every week.</p>
              <Link href="/tours" className="btn-primary mt-5">View all tours</Link>
            </div>
          )}

          <div className="mt-14 rounded-2xl bg-mist p-8 text-center">
            <h2 className="font-display text-xl font-bold">Looking for something custom?</h2>
            <p className="mt-2 text-sm text-slate-500">Tell us where you want to go — we&apos;ll build a tour around your dates, budget and group size.</p>
            <Link href="/contact" className="btn-primary mt-5">Request a custom tour</Link>
          </div>
        </div>
      </section>
    </>
  );
}
