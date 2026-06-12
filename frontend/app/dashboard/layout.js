'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/Icons';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: 'car' },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: 'calendar' },
  { href: '/dashboard/profile', label: 'Profile', icon: 'users' },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${pathname}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-400">Loading…</div>;
  }

  return (
    <div className="bg-mist">
      <div className="container-gc grid gap-8 py-10 lg:grid-cols-[240px,1fr]">
        <aside className="card h-fit p-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display font-bold text-amber-400">{user.name?.[0]}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <nav className="mt-3 grid gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${pathname === n.href ? 'bg-ink text-amber-400' : 'text-slate-600 hover:bg-mist'}`}
              >
                <Icon name={n.icon} className="h-4 w-4" /> {n.label}
              </Link>
            ))}
            <button onClick={async () => { await logout(); router.push('/'); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50">
              <Icon name="x" className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
