'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/Icons';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'car' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
  { href: '/admin/routes', label: 'Routes', icon: 'pin' },
  { href: '/admin/fares', label: 'Fares & Coupons', icon: 'rupee' },
  { href: '/admin/vehicles', label: 'Vehicles', icon: 'car' },
  { href: '/admin/drivers', label: 'Drivers', icon: 'users' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/blogs', label: 'Blog', icon: 'flag' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: 'star' },
  { href: '/admin/cms', label: 'CMS Pages', icon: 'briefcase' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: 'mail' },
  { href: '/admin/seo', label: 'SEO', icon: 'shield' },
  { href: '/admin/settings', label: 'Settings', icon: 'check' },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${pathname}`);
    else if (user.role !== 'admin') router.replace('/dashboard');
  }, [loading, user, router, pathname]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="grid min-h-screen place-items-center bg-mist text-slate-400">Loading admin…</div>;
  }

  return (
    <div className="flex min-h-screen bg-mist">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-ink text-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 font-display text-sm font-extrabold text-ink">GC</span>
          <span className="font-display font-extrabold">Admin</span>
        </div>
        <nav className="grid gap-0.5 overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
          {NAV.map((n) => {
            const active = n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? 'bg-amber-500 text-ink' : 'text-slate-300 hover:bg-white/5'}`}
              >
                <Icon name={n.icon} className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
          <button onClick={async () => { await logout(); router.push('/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-300 hover:bg-white/5">
            <Icon name="x" className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 lg:hidden" onClick={() => setOpen(true)}>
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <p className="hidden text-sm text-slate-400 lg:block">Global Cabs · Admin Panel</p>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-sm font-semibold text-amber-600 hover:underline">View site ↗</Link>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-sm font-bold text-amber-400">{user.name?.[0]}</span>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
