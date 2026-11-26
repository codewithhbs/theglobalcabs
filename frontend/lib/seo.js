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

// Local business schema — as supplied by client (website changes doc)
export const localBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'The Global Cabs',
  image: 'https://res.cloudinary.com/dpx7zjqj2/image/upload/v1781251286/globalcabs/settings/xzxworlqbwvclt1sn6rk.png',
  '@id': 'https://www.google.com/maps/place/The+Global+Cabs/@28.4445603,76.921564,707m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390d175372af60db:0x2dab26ec8cf347b6!8m2!3d28.4445603!4d76.921564!16s%2Fg%2F11w3r88dtm?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D',
  url: 'https://theglobalcabs.in/',
  telephone: '9416273735',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'H No 111, G. F, Shiva Enclave, Part - 1, Garhi Harsaru, Gurugram, Haryana 122505',
    addressLocality: 'Gurgaon',
    postalCode: '122505',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 28.4485525, longitude: 76.927831 },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  sameAs: ['https://www.facebook.com/GlobalCabs/', 'https://www.instagram.com/theglobalcabs/'],
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
