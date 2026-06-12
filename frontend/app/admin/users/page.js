'use client';
import ResourceManager from '@/components/admin/ResourceManager';

const config = {
  endpoint: '/users',
  title: 'Users',
  subtitle: 'Customers and admin accounts.',
  singular: 'user',
  searchKeys: ['name', 'email', 'phone'],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: (u) => <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${u.role === 'admin' ? 'bg-ink text-amber-400' : 'bg-mist text-slate-500'}`}>{u.role}</span> },
    { key: 'createdAt', label: 'Joined', render: (u) => new Date(u.createdAt).toLocaleDateString('en-IN') },
  ],
  fields: [
    { name: 'name', label: 'Full name', type: 'text', required: true, half: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true, half: true },
    { name: 'email', label: 'Email', type: 'email', required: true, half: true },
    { name: 'role', label: 'Role', type: 'select', half: true, options: ['customer', 'admin'] },
    { name: 'password', label: 'Password', type: 'password', half: true, hint: 'Required for new users; leave blank to keep unchanged when editing' },
  ],
};

export default function AdminUsersPage() {
  return <ResourceManager config={config} />;
}
