'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';

export default function Footer({ settings }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return null;
  const s = settings || {};

  return (
    <footer className="bg-ink text-slate-300">
      <div className="lane-animated" aria-hidden="true" />
      <div className="container-gc grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-ink"><Icon name="car" className="h-4 w-4" /></span>
            The Global Cabs
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {s.tagline || 'The journey begins with us.'} Reliable, fixed-fare cab service across Gurugram, Delhi NCR and North India — available 24x7.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[['About Us', '/about'], ['Our Services', '/services'], ['Popular Routes', '/routes'], ['Our Fleet', '/fleet'], ['Fare Calculator', '/fare-calculator'], ['Blog', '/blog']].map(([t, h]) => (
              <li key={h}><Link href={h} className="hover:text-amber-400">{t}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Support</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[['Contact Us', '/contact'], ['FAQ', '/faq'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms-and-conditions'], ['Cancellation Policy', '/cancellation-policy']].map(([t, h]) => (
              <li key={h}><Link href={h} className="hover:text-amber-400">{t}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Reach Us</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2"><Icon name="phone" className="mt-0.5 h-4 w-4 text-amber-400" /><a href={`tel:${s.phone || '+917827313298'}`} className="hover:text-amber-400">{s.phone || '+91 78273 13298'}</a></li>
            <li className="flex items-start gap-2"><Icon name="mail" className="mt-0.5 h-4 w-4 text-amber-400" /><a href={`mailto:${s.email || 'theglobalcabs@gmail.com'}`} className="hover:text-amber-400">{s.email || 'theglobalcabs@gmail.com'}</a></li>
            <li className="flex items-start gap-2"><Icon name="pin" className="mt-0.5 h-4 w-4 text-amber-400" />{s.address || 'Gurugram, Haryana, India'}</li>
            <li className="flex items-start gap-2"><Icon name="clock" className="mt-0.5 h-4 w-4 text-amber-400" />{s.workingHours || '24x7 Available'}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-gc flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {s.companyName || 'The Global Cabs'}. All rights reserved.</p>
          <p>Gurugram · Delhi NCR · North India</p>
        </div>
      </div>
      <a
        href={`https://wa.me/${(s.whatsapp || '+917827313298').replace(/\D/g, '')}?text=Hi%20Global%20Cabs%2C%20I%20want%20to%20book%20a%20cab.`}
        target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] p-3.5 text-white shadow-lift transition hover:scale-105"
      >
        <Icon name="whatsapp" className="h-6 w-6" />
      </a>
    </footer>
  );
}
