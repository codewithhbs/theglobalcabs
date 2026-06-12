'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icon } from './Icons';

const links = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/routes', label: 'Routes' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/fare-calculator', label: 'Fare Calculator' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar({ settings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="bg-ink text-xs text-slate-300">
        <div className="container-gc flex h-8 items-center justify-between">
          <p className="hidden sm:block">{settings?.announcement || '24x7 cab service in Gurugram & Delhi NCR'}</p>
          <a href={`tel:${settings?.phone || '+917827313298'}`} className="flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300">
            <Icon name="phone" className="h-3.5 w-3.5" /> {settings?.phone || '+91 78273 13298'}
          </a>
        </div>
      </div>
      <nav className="container-gc flex h-16 items-center justify-between" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
          {settings?.logo ? <img src={settings.logo?.url} alt="Logo" className="h-12 w-auto" /> : (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-ink"><Icon name="car" className="h-5 w-5" /></span>
              <span>The Global <span className="text-amber-600">Cabs</span></span>
            </>
          )}
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:text-amber-600 ${pathname === l.href ? 'text-amber-600' : 'text-slate-600'}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-ghost !py-2">
                {user.role === 'admin' ? 'Admin Panel' : 'My Account'}
              </Link>
              <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-ink">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-ink">Login</Link>
              <Link href="/#book" className="btn-primary !py-2.5">Book a Cab</Link>
            </>
          )}
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <Icon name={open ? 'x' : 'menu'} className="h-6 w-6" />
        </button>
      </nav>
      {open && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <ul className="container-gc space-y-1 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-mist">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-3 px-3 pt-3">
              {user ? (
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="btn-primary flex-1">My Account</Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1">Login</Link>
                  <Link href="/#book" onClick={() => setOpen(false)} className="btn-primary flex-1">Book a Cab</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
