'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import CmsPageForm from '@/components/admin/CmsPageForm';

export default function AdminCmsEditPage() {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/cms/pages/${id}`).then((r) => setPage(r.data)).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div>
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <Link href="/admin/cms" className="mt-3 inline-block text-sm font-bold text-amber-600">← Back to CMS pages</Link>
      </div>
    );
  }
  if (!page) return <p className="text-sm text-slate-400">Loading page…</p>;
  return <CmsPageForm key={page._id} page={page} />;
}
