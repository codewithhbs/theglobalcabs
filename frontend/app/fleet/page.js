import VehicleCard from '@/components/VehicleCard';
import SectionHeading from '@/components/SectionHeading';
import { getVehicles } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return buildMetadata('/fleet', {
    title: 'Our Fleet | Hatchback, Sedan, SUV & Luxury Cabs — Global Cabs',
    description: 'Choose from WagonR, Swift Dzire, Ertiga, Innova Crysta and luxury cars. AC, GPS-tracked, sanitized cabs with transparent per-km rates.',
  });
}

export default async function FleetPage() {
  const vehicles = await getVehicles();
  const categories = [...new Set(vehicles.map((v) => v.category))];

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">Fleet</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">A car for every journey and budget.</h1>
          <p className="mt-4 max-w-lg text-slate-300">All cabs are AC, GPS-tracked and cleaned before every trip. Rates shown are per kilometre.</p>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc">
          {categories.map((cat) => (
            <div key={cat} className="mb-14 last:mb-0">
              <SectionHeading eyebrow={cat} title={`${cat} class`} />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {vehicles.filter((v) => v.category === cat).map((v) => <VehicleCard key={v._id} vehicle={v} />)}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && <p className="text-slate-500">Fleet is being updated. Please check back soon.</p>}
        </div>
      </section>
    </>
  );
}
