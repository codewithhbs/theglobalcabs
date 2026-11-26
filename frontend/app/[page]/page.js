import { notFound } from 'next/navigation';
import { getPublicPage } from '@/lib/api';
import { faqSchema } from '@/lib/seo';
import FaqAccordion from '@/components/FaqAccordion';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theglobalcabs.com';
const FAQ_TOKEN = /<p>\s*\[faqs\]\s*<\/p>/i; // put [faqs] on its own line in the editor to place the FAQ section

const loadPage = async (slug) => {
  const page = await getPublicPage(slug);
  return page && page.status === 'active' ? page : null;
};

export async function generateMetadata({ params }) {
  const { page: slug } = await params;
  const page = await loadPage(slug);
  if (!page) return {};
  const s = page.seo || {};
  const title = s.metaTitle || `${page.title} | The Global Cabs`;
  const description = s.metaDescription || `${page.title} — The Global Cabs, Gurugram.`;
  return {
    title: { absolute: title },
    description,
    keywords: s.keywords?.length ? s.keywords : undefined,
    alternates: { canonical: s.canonical || `${SITE}/${slug}` },
    robots: s.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: s.ogTitle || title,
      description: s.ogDescription || description,
      url: `${SITE}/${slug}`,
      siteName: 'The Global Cabs',
      type: 'website',
      images: s.ogImage ? [{ url: s.ogImage }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: s.ogTitle || title, description: s.ogDescription || description },
  };
}

const proseClass = 'prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-amber-600 prose-img:rounded-xl';

const safeJsonLd = (raw) => {
  try { return JSON.stringify(JSON.parse(raw)).replace(/</g, '\\u003c'); } catch { return null; }
};

export default async function CmsPage({ params }) {
  const { page: slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  const html = page.content || '';
  const [before, ...rest] = html.split(FAQ_TOKEN);
  const after = rest.join('');
  const faqs = (page.faqs || []).filter((f) => f.question && f.answer);
  const customSchema = page.seo?.schemaMarkup ? safeJsonLd(page.seo.schemaMarkup) : null;

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <h1 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{page.title}</h1>
          {page.updatedAt && (
            <p className="mt-3 text-sm text-slate-400">
              Last updated: {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc max-w-3xl">
          {before && <div className={proseClass} dangerouslySetInnerHTML={{ __html: before }} />}
          {faqs.length > 0 && (
            <div className="my-10">
              <h2 className="font-display text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="mt-5"><FaqAccordion faqs={faqs} /></div>
            </div>
          )}
          {after && <div className={proseClass} dangerouslySetInnerHTML={{ __html: after }} />}
        </div>
      </section>

      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
      {customSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: customSchema }} />}
    </>
  );
}
