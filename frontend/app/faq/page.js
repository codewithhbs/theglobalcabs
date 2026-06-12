import FaqAccordion from '@/components/FaqAccordion';
import { getPage } from '@/lib/api';
import { buildMetadata, faqSchema } from '@/lib/seo';
import Link from 'next/link';

export async function generateMetadata() {
  return buildMetadata('/faq', {
    title: 'FAQs | Global Cabs Gurugram',
    description: 'Answers to common questions about cab bookings, fares, cancellations, payments and more.',
  });
}

export default async function FaqPage() {
  const page = await getPage('faq');
  const faqs = page?.faqs || [];

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">FAQ</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Questions, answered.</h1>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc max-w-3xl">
          {faqs.length > 0 ? (
            <>
              <FaqAccordion faqs={faqs} />
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
            </>
          ) : (
            <p className="text-slate-500">FAQs are being updated.</p>
          )}
          <div className="mt-12 rounded-2xl bg-mist p-8 text-center">
            <h2 className="font-display text-xl font-bold">Still have a question?</h2>
            <p className="mt-2 text-sm text-slate-500">Our team is available 24x7 on call and WhatsApp.</p>
            <Link href="/contact" className="btn-primary mt-5">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
