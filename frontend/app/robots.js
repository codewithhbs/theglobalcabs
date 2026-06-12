const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theglobalcabs.com';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/login', '/register'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
