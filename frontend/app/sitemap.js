import { getRoutes, getBlogs, getVehicles } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theglobalcabs.com';

export default async function sitemap() {
  const staticPages = [
    '', '/about', '/services', '/fleet', '/routes', '/fare-calculator',
    '/blog', '/contact', '/faq', '/privacy-policy', '/terms-and-conditions', '/cancellation-policy',
  ].map((p) => ({ url: `${SITE}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));

  const [routes, blogs, vehicles] = await Promise.all([getRoutes(), getBlogs(), getVehicles()]);

  return [
    ...staticPages,
    ...routes.map((r) => ({ url: `${SITE}/routes/${r.slug}`, lastModified: r.updatedAt, changeFrequency: 'weekly', priority: 0.8 })),
    ...blogs.map((b) => ({ url: `${SITE}/blog/${b.slug}`, lastModified: b.updatedAt, changeFrequency: 'monthly', priority: 0.6 })),
    ...vehicles.map((v) => ({ url: `${SITE}/fleet/${v.slug}`, lastModified: v.updatedAt, changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
