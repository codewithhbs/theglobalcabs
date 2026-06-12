import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import RouteCard from '@/components/RouteCard';
import VehicleCard from '@/components/VehicleCard';
import TestimonialCard from '@/components/TestimonialCard';
import FaqAccordion from '@/components/FaqAccordion';
import SectionHeading from '@/components/SectionHeading';
import { Icon } from '@/components/Icons';
import { getPopularRoutes, getVehicles, getTestimonials, getPage, getSettings } from '@/lib/api';
import { buildMetadata, faqSchema } from '@/lib/seo';
import { SERVICES, WHY_US } from '@/lib/constants';

export async function generateMetadata() {
  return buildMetadata('/', {
    title: 'Global Cabs — Taxi Service in Gurugram | Airport Transfer, Outstation & Local Rental',
    description:
      'Book reliable cabs in Gurugram & Delhi NCR. Fixed fares for IGI Airport transfers, outstation trips to Jaipur, Agra, Chandigarh & local 8hr/80km rentals. 24x7 service, verified drivers.',
  });
}

export default async function HomePage() {
  const [routes, vehicles, testimonials, faqPage, settings] = await Promise.all([
    getPopularRoutes(),
    getVehicles(),
    getTestimonials(),
    getPage('faq'),
    getSettings(),
  ]);
  const faqs = faqPage?.faqs?.slice(0, 5) || [];
  const phone = settings?.phone || '+91 78273 13298';

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink pb-20 pt-14 text-white sm:pt-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #FBBF24 0, transparent 40%), radial-gradient(circle at 80% 70%, #F5A623 0, transparent 45%)' }} />
        <div className="container-gc relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-amber-400">Gurugram · Delhi NCR · Outstation</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Cabs that show up <span className="text-amber-400">on time.</span> Fares that don&apos;t surprise.
            </h1>
            <p className="mt-5 max-w-lg text-slate-300">
              Airport transfers, outstation trips and local rentals across Delhi NCR — with verified drivers, fixed fares and 24x7 support.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-primary">
                <Icon name="phone" className="h-4 w-4" /> Call {phone}
              </a>
              <Link href="/routes" className="btn-ghost border-slate-600 text-white hover:text-amber-400">
                Explore routes
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[['10k+', 'Trips completed'], ['50+', 'Cities covered'], ['4.8★', 'Average rating']].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-extrabold text-amber-400">{v}</p>
                  <p className="mt-1 text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:justify-self-end">
            <BookingForm />
          </div>
        </div>
        <div className="lane-animated absolute bottom-0 left-0 right-0" />
      </section>

      {/* POPULAR ROUTES */}
      <section className="bg-mist py-20">
        <div className="container-gc">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Popular routes" title="Where do you want to go?" subtitle="Fixed fares on our most-booked routes — airport, railway and intercity." />
            <Link href="/routes" className="btn-ghost">All routes →</Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {routes.map((r) => <RouteCard key={r._id} route={r} />)}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container-gc">
          <SectionHeading center eyebrow="What we do" title="One cab company, every kind of trip" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="card group p-7 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-500 group-hover:text-ink">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.short}</p>
                <p className="mt-4 text-sm font-semibold text-amber-600">Learn more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-ink py-20 text-white">
        <div className="container-gc">
          <SectionHeading center eyebrow="Why Global Cabs" title="Built on trust, run on time" />
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((w) => (
              <div key={w.title} className="flex gap-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-400">
                  <Icon name="check" className="h-4.5 w-4.5 h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold">{w.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lane mt-16" />
      </section>

      {/* FLEET */}
      <section className="py-20">
        <div className="container-gc">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Our fleet" title="A car for every journey" subtitle="From budget hatchbacks to premium SUVs — all GPS-tracked, AC and freshly cleaned." />
            <Link href="/fleet" className="btn-ghost">View fleet →</Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {vehicles.slice(0, 4).map((v) => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="bg-mist py-20">
          <div className="container-gc">
            <SectionHeading center eyebrow="Happy riders" title="What our customers say" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {testimonials.slice(0, 4).map((t) => <TestimonialCard key={t._id} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-20">
          <div className="container-gc grid gap-12 lg:grid-cols-[1fr,1.4fr]">
            <div>
              <SectionHeading eyebrow="FAQ" title="Questions, answered" subtitle="Everything you need to know before booking." />
              <Link href="/faq" className="btn-ghost mt-8">All FAQs →</Link>
            </div>
            <FaqAccordion faqs={faqs} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="container-gc">
          <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center text-white sm:px-14">
            <div className="lane-animated absolute left-0 right-0 top-0" />
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Ready to ride?</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-300">Get an instant fare and confirm your cab in under a minute — or just call us, we&apos;re awake 24x7.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/fare-calculator" className="btn-primary">Check fare now</Link>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-ghost border-slate-600 text-white hover:text-amber-400"><Icon name="phone" className="h-4 w-4" /> {phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
