import { resolveSeo } from './api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theglobalcabs.com';

// Builds Next.js metadata, merging admin-managed SEO overrides over sensible defaults.
export async function buildMetadata(path, defaults = {}) {
  const meta = await resolveSeo(path);
  const title = meta?.metaTitle || defaults.title || 'The Global Cabs';
  const description = meta?.metaDescription || defaults.description ||
    'Book reliable cabs in Gurugram & Delhi NCR — airport transfers, railway pickups, local rentals and one-way outstation taxis at transparent fixed fares.';
  return {
    title,
    description,
    keywords: meta?.keywords?.length ? meta.keywords : defaults.keywords,
    alternates: { canonical: meta?.canonical || `${SITE}${path}` },
    robots: meta?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: meta?.ogTitle || title,
      description: meta?.ogDescription || description,
      url: `${SITE}${path}`,
      siteName: 'The Global Cabs',
      type: 'website',
      images: meta?.ogImage?.url ? [{ url: meta.ogImage.url }] : defaults.ogImages,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export const localBusinessSchema = (settings) => ({
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: settings?.companyName || 'The Global Cabs',
  url: SITE,
  telephone: settings?.phone || '+91 7827313298',
  email: settings?.email || 'ishant.globalcabs@gmail.com',
  areaServed: ['Gurugram', 'Delhi NCR', 'North India'],
  address: { '@type': 'PostalAddress', addressLocality: 'Gurugram', addressRegion: 'Haryana', addressCountry: 'IN' },
  openingHours: 'Mo-Su 00:00-24:00',
});

export const faqSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});
