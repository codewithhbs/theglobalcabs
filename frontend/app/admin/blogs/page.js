'use client';
import Image from 'next/image';
import ResourceManager from '@/components/admin/ResourceManager';
import { StatusBadge } from '@/components/admin/Shared';

const config = {
  endpoint: '/blogs',
  title: 'Blog',
  subtitle: 'Articles for SEO and customer engagement. Content supports HTML.',
  singular: 'post',
  searchKeys: ['title', 'category'],
  columns: [
    {
      key: 'coverImage',
      label: '',
      render: (b) => b.coverImage?.url
        ? <span className="relative block h-10 w-16 overflow-hidden rounded-lg"><Image src={b.coverImage.url} alt="" fill sizes="64px" className="object-cover" /></span>
        : <span className="block h-10 w-16 rounded-lg bg-mist" />,
    },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'views', label: 'Views' },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'createdAt', label: 'Created', render: (b) => new Date(b.createdAt).toLocaleDateString('en-IN') },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', half: true, placeholder: 'Travel Tips' },
    { name: 'status', label: 'Status', type: 'select', half: true, options: ['draft', 'published'] },
    { name: 'coverImage', label: 'Cover image', type: 'file', half: true },
    { name: 'tags', label: 'Tags', type: 'tags', half: true, hint: 'comma, separated' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, hint: 'Short summary shown on listing cards & meta description' },
    { name: 'content', label: 'Content (HTML supported)', type: 'textarea', rows: 12, required: true, hint: 'Use <h2>, <p>, <ul>, <img> etc.' },
    { name: 'seo.metaTitle', label: 'SEO meta title', type: 'text', half: true },
    { name: 'seo.metaDescription', label: 'SEO meta description', type: 'text', half: true },
  ],
};

const transformBody = (values) => {
  const out = { ...values };
  const seo = {};
  Object.keys(out).forEach((k) => {
    if (k.startsWith('seo.')) {
      seo[k.slice(4)] = out[k];
      delete out[k];
    }
  });
  if (Object.keys(seo).length) out.seo = seo;
  return out;
};

export default function AdminBlogsPage() {
  return <ResourceManager config={config} transformBody={transformBody} />;
}
