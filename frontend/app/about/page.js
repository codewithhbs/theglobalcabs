import Image from 'next/image';
import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import { Icon } from '@/components/Icons';
import { getPage, getTestimonials } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { WHY_US } from '@/lib/constants';
import TestimonialCard from '@/components/TestimonialCard';

export async function generateMetadata() {
  return buildMetadata('/about', {
    title: 'About Us | Global Cabs — Trusted Taxi Service in Gurugram',
    description: 'Global Cabs is a Gurugram-based cab company providing airport transfers, outstation taxis and local rentals across Delhi NCR with verified drivers and fixed fares.',
  });
}

export default async function AboutPage() {
  const [page, testimonials] = await Promise.all([getPage('about'), getTestimonials()]);

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">About us</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            The cab company Gurugram actually relies on.
          </h1>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc grid items-start gap-12 lg:grid-cols-2">
          <div
            className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-amber-600"
            dangerouslySetInnerHTML={{ __html: page?.content || '<p>Global Cabs is a Gurugram-based taxi service offering airport transfers, outstation trips and local rentals across Delhi NCR, 24x7.</p>' }}
          />
          <div className="grid gap-6">
            <div className="card grid grid-cols-3 gap-6 p-8 text-center">
              {[['10k+', 'Trips'], ['50+', 'Cities'], ['24x7', 'Support']].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl font-extrabold text-amber-600">{v}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{l}</p>
                </div>
              ))}
            </div>
            <div className="relative h-72 overflow-hidden rounded-2xl bg-ink">
              <Image src="https://images.unsplash.com/photo-1549194388-2469d59ec62d?q=80&w=1200&auto=format" alt="Cab on highway at dusk" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover opacity-90" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-gc">
          <SectionHeading center eyebrow="Our promise" title="Why riders stay with us" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((w) => (
              <div key={w.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-50 text-amber-600"><Icon name="check" className="h-5 w-5" /></span>
                <h3 className="mt-4 font-display font-bold">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-16">
          <div className="container-gc">
            <SectionHeading center eyebrow="Riders speak" title="In their words" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => <TestimonialCard key={t._id} t={t} />)}
            </div>
            <div className="mt-10 text-center"><Link href="/contact" className="btn-primary">Talk to us</Link></div>
          </div>
        </section>
      )}
    </>
  );
}
