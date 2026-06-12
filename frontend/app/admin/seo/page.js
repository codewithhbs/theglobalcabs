'use client';
import ResourceManager from '@/components/admin/ResourceManager';

const config = {
  endpoint: '/seo',
  title: 'SEO Management',
  subtitle: 'Per-page meta overrides. Sitemap.xml & robots.txt are generated automatically.',
  singular: 'SEO entry',
  searchKeys: ['path', 'metaTitle'],
  columns: [
    { key: 'path', label: 'Path', render: (s) => <span className="font-mono text-xs font-bold">{s.path}</span> },
    { key: 'metaTitle', label: 'Meta title', render: (s) => <span className="block max-w-[280px] truncate">{s.metaTitle || '—'}</span> },
    { key: 'noIndex', label: 'Index', render: (s) => (s.noIndex ? <span className="text-xs font-bold text-red-500">noindex</span> : <span className="text-xs text-emerald-600">indexed</span>) },
    { key: 'updatedAt', label: 'Updated', render: (s) => new Date(s.updatedAt).toLocaleDateString('en-IN') },
  ],
  fields: [
    { name: 'path', label: 'Page path', type: 'text', required: true, placeholder: '/ or /fleet or /routes/gurugram-to-igi-airport', hint: 'Must start with /' },
    { name: 'metaTitle', label: 'Meta title', type: 'text', hint: '≤ 60 characters recommended' },
    { name: 'metaDescription', label: 'Meta description', type: 'textarea', rows: 2, hint: '≤ 160 characters recommended' },
    { name: 'keywords', label: 'Keywords', type: 'tags', hint: 'comma, separated' },
    { name: 'ogTitle', label: 'OG title', type: 'text', half: true },
    { name: 'canonical', label: 'Canonical URL', type: 'text', half: true },
    { name: 'ogDescription', label: 'OG description', type: 'textarea', rows: 2 },
    { name: 'noIndex', label: 'No-index', type: 'checkbox', hint: 'Hide this page from search engines', half: true },
    { name: 'schemaMarkup', label: 'Schema markup (raw JSON-LD)', type: 'textarea', rows: 6, hint: 'Optional. Injected as <script type="application/ld+json">' },
  ],
};

export default function AdminSeoPage() {
  return <ResourceManager config={config} />;
}
