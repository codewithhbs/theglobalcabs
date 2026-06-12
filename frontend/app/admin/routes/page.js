'use client';
import Image from 'next/image';
import ResourceManager from '@/components/admin/ResourceManager';
import { StatusBadge } from '@/components/admin/Shared';

const config = {
  endpoint: '/routes',
  title: 'Routes',
  subtitle: 'Manage pickup→drop routes shown on the website.',
  singular: 'route',
  searchKeys: ['name', 'pickupLocation', 'dropLocation', 'category'],
  columns: [
    {
      key: 'image',
      label: '',
      render: (r) => r.image?.url
        ? <span className="relative block h-10 w-16 overflow-hidden rounded-lg"><Image src={r.image.url} alt="" fill sizes="64px" className="object-cover" /></span>
        : <span className="block h-10 w-16 rounded-lg bg-mist" />,
    },
    { key: 'pickupLocation', label: 'From' },
    { key: 'dropLocation', label: 'To' },
    { key: 'category', label: 'Category' },
    { key: 'distanceKm', label: 'Km' },
    { key: 'isPopular', label: 'Popular', render: (r) => (r.isPopular ? '⭐' : '—') },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ],
  fields: [
    { name: 'pickupLocation', label: 'Pickup location', type: 'text', required: true, half: true },
    { name: 'dropLocation', label: 'Drop location', type: 'text', required: true, half: true },
    { name: 'distanceKm', label: 'Distance (km)', type: 'number', required: true, half: true },
    { name: 'estimatedTime', label: 'Estimated time', type: 'text', placeholder: 'e.g. 1 hr 20 min', half: true },
    {
      name: 'category', label: 'Category', type: 'select', required: true, half: true,
      options: ['oneWay', 'roundTrip', 'airport', 'railway', 'local', 'outstation'],
    },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], half: true },
    { name: 'isPopular', label: 'Show in popular routes', type: 'checkbox', hint: 'Featured on homepage', half: true },
    { name: 'image', label: 'Route image', type: 'file', half: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { name: 'seo.metaTitle', label: 'SEO meta title', type: 'text', half: true },
    { name: 'seo.metaDescription', label: 'SEO meta description', type: 'text', half: true },
  ],
};

// nest seo.* keys back into object
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

export default function AdminRoutesPage() {
  return <ResourceManager config={config} transformBody={transformBody} />;
}
