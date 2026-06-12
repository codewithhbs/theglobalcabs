import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import RouteCard from '@/components/RouteCard';
import { Icon } from '@/components/Icons';
import { buildMetadata } from '@/lib/seo';
import { SERVICES, WHY_US } from '@/lib/constants';
import { getPopularRoutes, getSettings } from '@/lib/api';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return buildMetadata(`/services/${slug}`, {
    title: `${service.title} in Gurugram | Global Cabs`,
    description: service.short,
  });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const [routes, settings] = await Promise.all([getPopularRoutes(), getSettings()]);
  const phone = settings?.phone || '+91 78273 13298';

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-amber-400">Service</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{service.title}</h1>
            <p className="mt-5 max-w-lg leading-relaxed text-slate-300">{service.body}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-primary"><Icon name="phone" className="h-4 w-4" /> Call {phone}</a>
              <Link href="/fare-calculator" className="btn-ghost border-slate-600 text-white hover:text-amber-400">Check fare</Link>
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {WHY_US.slice(0, 4).map((w) => (
                <li key={w.title} className="flex items-center gap-2 text-sm text-slate-300">
                  <Icon name="check" className="h-4 w-4 text-amber-400" /> {w.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:justify-self-end"><BookingForm /></div>
        </div>
        <div className="lane mt-12" />
      </section>

      {routes.length > 0 && (
        <section className="py-16">
          <div className="container-gc">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Popular routes</h2>
              <Link href="/routes" className="btn-ghost">All routes →</Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {routes.slice(0, 4).map((r) => <RouteCard key={r._id} route={r} />)}
            </div>
          </div>
        </section>
      )}

      <section className="bg-mist py-16">
        <div className="container-gc">
          <h2 className="font-display text-2xl font-extrabold">Other services</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICES.filter((s) => s.slug !== slug).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="card flex items-center gap-3 p-4 text-sm font-semibold transition hover:border-amber-400">
                <Icon name={s.icon} className="h-5 w-5 text-amber-600" /> {s.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
