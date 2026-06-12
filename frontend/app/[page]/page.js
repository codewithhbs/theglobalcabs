import { notFound } from 'next/navigation';
import { getPage } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

const CMS_PAGES = ['privacy-policy', 'terms-and-conditions', 'cancellation-policy'];

export function generateStaticParams() {
  return CMS_PAGES.map((page) => ({ page }));
}

export async function generateMetadata({ params }) {
  const { page: slug } = await params;
  if (!CMS_PAGES.includes(slug)) return {};
  const page = await getPage(slug);
  return buildMetadata(`/${slug}`, {
    title: page?.seo?.metaTitle || `${page?.title || slug} | Global Cabs`,
    description: page?.seo?.metaDescription || `${page?.title || ''} — Global Cabs, Gurugram.`,
  });
}

export default async function CmsPage({ params }) {
  const { page: slug } = await params;
  if (!CMS_PAGES.includes(slug)) notFound();
  const page = await getPage(slug);
  if (!page) notFound();

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
        <div
          className="container-gc prose prose-slate max-w-3xl prose-headings:font-display prose-headings:font-bold prose-a:text-amber-600"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </section>
    </>
  );
}
