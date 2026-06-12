'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import ResourceManager from '@/components/admin/ResourceManager';
import { StatusBadge } from '@/components/admin/Shared';
import { api } from '@/lib/api';

export default function AdminDriversPage() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api('/vehicles?limit=100').then((r) => setVehicles(r.data)).catch(() => {});
  }, []);

  const config = {
    endpoint: '/drivers',
    title: 'Drivers',
    subtitle: 'Driver profiles, documents and vehicle assignment.',
    singular: 'driver',
    searchKeys: ['name', 'phone', 'licenseNumber'],
    columns: [
      {
        key: 'photo',
        label: '',
        render: (d) => d.photo?.url
          ? <span className="relative block h-10 w-10 overflow-hidden rounded-full"><Image src={d.photo.url} alt="" fill sizes="40px" className="object-cover" /></span>
          : <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display text-sm font-bold text-amber-400">{d.name?.[0]}</span>,
      },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'licenseNumber', label: 'License' },
      { key: 'assignedVehicle.name', label: 'Vehicle' },
      { key: 'experienceYears', label: 'Exp (yrs)' },
      { key: 'availability', label: 'Availability', render: (d) => <StatusBadge status={d.availability} /> },
      { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    ],
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true, half: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true, half: true },
      { name: 'email', label: 'Email', type: 'email', half: true },
      { name: 'licenseNumber', label: 'License number', type: 'text', required: true, half: true },
      { name: 'experienceYears', label: 'Experience (years)', type: 'number', half: true },
      { name: 'assignedVehicle', label: 'Assigned vehicle', type: 'select', half: true, options: vehicles.map((v) => ({ value: v._id, label: v.name })) },
      { name: 'availability', label: 'Availability', type: 'select', half: true, options: [{ value: 'available', label: 'Available' }, { value: 'onTrip', label: 'On trip' }, { value: 'offDuty', label: 'Off duty' }] },
      { name: 'status', label: 'Status', type: 'select', half: true, options: ['active', 'inactive'] },
      { name: 'photo', label: 'Photo', type: 'file', half: true },
      { name: 'documents', label: 'Documents (license, RC, etc — up to 5)', type: 'files', accept: 'image/*,application/pdf', half: true },
      { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
    ],
    toForm: (d) => ({ ...d, assignedVehicle: d.assignedVehicle?._id || d.assignedVehicle || '' }),
  };

  return <ResourceManager config={config} />;
}
