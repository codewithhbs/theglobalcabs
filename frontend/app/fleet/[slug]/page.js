import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { Icon } from '@/components/Icons';
import { getVehicle, getVehicles } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) return {};
  return buildMetadata(`/fleet/${slug}`, {
    title: `${vehicle.name} on Rent in Gurugram — ₹${vehicle.perKmRate}/km | Global Cabs`,
    description: `Book ${vehicle.name} (${vehicle.seatingCapacity}+1 seater ${vehicle.category}) at ₹${vehicle.perKmRate}/km for airport transfers, outstation & local trips in Delhi NCR.`,
  });
}

export default async function VehicleDetailPage({ params }) {
  const { slug } = await params;
  const [vehicle, all] = await Promise.all([getVehicle(slug), getVehicles()]);
  if (!vehicle) notFound();

  const others = all.filter((v) => v.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-amber-400">{vehicle.category}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{vehicle.name}</h1>
            <p className="mt-4 max-w-lg text-slate-300">{vehicle.description}</p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="font-display text-xl font-extrabold text-amber-400">₹{vehicle.perKmRate}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Per km</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="font-display text-xl font-extrabold text-amber-400">{vehicle.seatingCapacity}+1</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Seater</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="font-display text-xl font-extrabold text-amber-400">{vehicle.luggageCapacity}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Bags</p>
              </div>
            </div>

            {vehicle.features?.length > 0 && (
              <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Icon name="check" className="h-4 w-4 text-amber-400" /> {f}
                  </li>
                ))}
              </ul>
            )}

            <div className="relative mt-10 h-64 overflow-hidden rounded-2xl bg-white/5 sm:h-80">
              {vehicle.images?.[0]?.url ? (
                <Image src={vehicle.images[0].url} alt={vehicle.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-slate-600"><Icon name="car" className="h-20 w-20" /></div>
              )}
            </div>
          </div>
          <div className="lg:justify-self-end"><BookingForm preselect={{ vehicleId: vehicle._id }} /></div>
        </div>
        <div className="lane mt-12" />
      </section>

      {others.length > 0 && (
        <section className="py-16">
          <div className="container-gc">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-3xl font-extrabold tracking-tight">More from our fleet</h2>
              <Link href="/fleet" className="btn-ghost">View all →</Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((v) => (
                <Link key={v._id} href={`/fleet/${v.slug}`} className="card flex items-center justify-between p-5 transition hover:border-amber-400">
                  <div>
                    <p className="font-display font-bold">{v.name}</p>
                    <p className="text-xs text-slate-400">{v.category} · {v.seatingCapacity}+1 seater</p>
                  </div>
                  <p className="font-bold text-amber-600">₹{v.perKmRate}/km</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
