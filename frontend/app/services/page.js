import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import { Icon } from '@/components/Icons';
import { buildMetadata } from '@/lib/seo';
import { SERVICES } from '@/lib/constants';

export async function generateMetadata() {
  return buildMetadata('/services', {
    title: 'Our Services | Global Cabs Gurugram',
    description: 'Local taxi, outstation cabs, airport transfers, one-way drops, round trips and corporate cab services in Gurugram & Delhi NCR.',
  });
}

export default function ServicesPage() {
  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">Services</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Every kind of trip, one trusted fleet.</h1>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc">
          <SectionHeading eyebrow="What we offer" title="Pick your ride type" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="card group p-7 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-ink">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-lg font-bold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.short}</p>
                <p className="mt-4 text-sm font-semibold text-amber-600">Learn more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
