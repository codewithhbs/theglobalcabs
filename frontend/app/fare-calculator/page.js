import BookingForm from '@/components/BookingForm';
import { Icon } from '@/components/Icons';
import { buildMetadata } from '@/lib/seo';
import { WHY_US } from '@/lib/constants';

export async function generateMetadata() {
  return buildMetadata('/fare-calculator', {
    title: 'Cab Fare Calculator | Instant Taxi Fare Estimate — Global Cabs',
    description: 'Get an instant, all-inclusive cab fare estimate for any trip from Gurugram — airport, outstation, one-way or local rental. No hidden charges.',
  });
}

export default function FareCalculatorPage() {
  return (
    <section className="bg-ink py-16 text-white">
      <div className="container-gc grid items-start gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-amber-400">Fare calculator</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Know your fare before you book.</h1>
          <p className="mt-5 max-w-lg text-slate-300">
            Pick a route or enter your own distance — we&apos;ll show the exact fare breakdown including base fare, seasonal pricing, peak-hour charges, discounts and tax. The price you see is the price you pay.
          </p>
          <ul className="mt-10 grid gap-4">
            {WHY_US.slice(0, 3).map((w) => (
              <li key={w.title} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-400"><Icon name="check" className="h-4 w-4" /></span>
                <div>
                  <p className="font-semibold">{w.title}</p>
                  <p className="text-sm text-slate-400">{w.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:justify-self-end"><BookingForm /></div>
      </div>
      <div className="lane mt-12" />
    </section>
  );
}
