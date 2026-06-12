'use client';
import Image from 'next/image';
import ResourceManager from '@/components/admin/ResourceManager';
import { StatusBadge } from '@/components/admin/Shared';

const config = {
  endpoint: '/vehicles',
  title: 'Vehicles',
  subtitle: 'Fleet categories, rates and photos.',
  singular: 'vehicle',
  searchKeys: ['name', 'category'],
  columns: [
    {
      key: 'images',
      label: '',
      render: (v) => v.images?.[0]?.url
        ? <span className="relative block h-10 w-16 overflow-hidden rounded-lg"><Image src={v.images[0].url} alt="" fill sizes="64px" className="object-cover" /></span>
        : <span className="block h-10 w-16 rounded-lg bg-mist" />,
    },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'seatingCapacity', label: 'Seats', render: (v) => `${v.seatingCapacity}+1` },
    { key: 'perKmRate', label: '₹/km', render: (v) => `₹${v.perKmRate}` },
    { key: 'minimumFare', label: 'Min fare', render: (v) => `₹${v.minimumFare}` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v.status} /> },
  ],
  fields: [
    { name: 'name', label: 'Vehicle name', type: 'text', required: true, half: true, placeholder: 'e.g. Swift Dzire' },
    { name: 'category', label: 'Category', type: 'select', required: true, half: true, options: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'] },
    { name: 'seatingCapacity', label: 'Seating capacity (excl. driver)', type: 'number', required: true, half: true },
    { name: 'luggageCapacity', label: 'Luggage (bags)', type: 'number', half: true },
    { name: 'perKmRate', label: 'Per-km rate (₹)', type: 'number', required: true, half: true },
    { name: 'minimumFare', label: 'Minimum fare (₹)', type: 'number', half: true },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], half: true },
    { name: 'images', label: 'Photos (up to 6)', type: 'files', half: true },
    { name: 'features', label: 'Features', type: 'tags', hint: 'Comma separated — AC, GPS Tracking, Music System' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
  ],
};

export default function AdminVehiclesPage() {
  return <ResourceManager config={config} />;
}
