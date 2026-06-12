import ContactForm from '@/components/ContactForm';
import { Icon } from '@/components/Icons';
import { getSettings } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return buildMetadata('/contact', {
    title: 'Contact Us | Global Cabs Gurugram — 24x7 Cab Booking',
    description: 'Call, WhatsApp or write to Global Cabs for cab bookings in Gurugram & Delhi NCR. We respond 24x7.',
  });
}

export default async function ContactPage() {
  const settings = await getSettings();
  const phone = settings?.phone || '+91 78273 13298';
  const altPhone = settings?.altPhone || '+91 94162 73735';
  const email = settings?.email || 'theglobalcabs@gmail.com';
  const address = settings?.address || 'Gurugram, Haryana, India';

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">Contact</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">We&apos;re awake when you travel.</h1>
          <p className="mt-4 max-w-lg text-slate-300">Late-night flight or early-morning train — call any time, any day.</p>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc grid items-start gap-12 lg:grid-cols-[1fr,1.2fr]">
          <div className="grid gap-4">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="card flex items-center gap-4 p-6 transition hover:border-amber-400">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600"><Icon name="phone" className="h-6 w-6" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Call us 24x7</p>
                <p className="font-display font-bold">{phone}</p>
                <p className="text-sm text-slate-500">{altPhone}</p>
              </div>
            </a>
            <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-6 transition hover:border-amber-400">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600"><Icon name="whatsapp" className="h-6 w-6" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">WhatsApp</p>
                <p className="font-display font-bold">Chat with us</p>
              </div>
            </a>
            <a href={`mailto:${email}`} className="card flex items-center gap-4 p-6 transition hover:border-amber-400">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600"><Icon name="mail" className="h-6 w-6" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                <p className="font-display font-bold">{email}</p>
              </div>
            </a>
            <div className="card flex items-center gap-4 p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600"><Icon name="pin" className="h-6 w-6" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Office</p>
                <p className="font-display font-bold">{address}</p>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="font-display text-xl font-extrabold">Send an enquiry</h2>
            <p className="mt-1 text-sm text-slate-500">We typically respond within 30 minutes.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
