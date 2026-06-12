'use client';
import ResourceManager from '@/components/admin/ResourceManager';
import { StatusBadge } from '@/components/admin/Shared';

const config = {
  endpoint: '/testimonials',
  title: 'Testimonials',
  subtitle: 'Customer reviews shown on the website.',
  singular: 'testimonial',
  searchKeys: ['name', 'message'],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'designation', label: 'Designation' },
    { key: 'rating', label: 'Rating', render: (t) => '★'.repeat(t.rating || 5) },
    { key: 'message', label: 'Message', render: (t) => <span className="block max-w-[280px] truncate text-xs text-slate-500">{t.message}</span> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ],
  fields: [
    { name: 'name', label: 'Customer name', type: 'text', required: true, half: true },
    { name: 'designation', label: 'Designation / city', type: 'text', half: true, placeholder: 'Frequent Flyer, Gurugram' },
    { name: 'rating', label: 'Rating (1–5)', type: 'number', half: true },
    { name: 'status', label: 'Status', type: 'select', half: true, options: ['active', 'inactive'] },
    { name: 'avatar', label: 'Photo', type: 'file', half: true },
    { name: 'message', label: 'Message', type: 'textarea', rows: 4, required: true },
  ],
};

export default function AdminTestimonialsPage() {
  return <ResourceManager config={config} />;
}
