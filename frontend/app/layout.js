import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSettings } from '@/lib/api';
import { localBusinessSchema } from '@/lib/seo';

const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://theglobalcabs.com';

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'The Global Cabs — Taxi Service in Gurugram | Airport Transfers & Outstation Cabs',
    template: '%s | The Global Cabs',
  },
  description:
    'Book reliable cabs in Gurugram & Delhi NCR. Fixed-fare airport transfers, railway pickups, local rentals (8hr/80km) and one-way outstation taxis. 24x7 service, verified drivers.',
  keywords: ['taxi gurugram', 'cab booking gurgaon', 'airport transfer delhi', 'outstation cab', 'one way taxi'],
  openGraph: { siteName: 'The Global Cabs', type: 'website' },
};

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(settings)) }}
        />
        <AuthProvider>
          <Navbar settings={settings} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer settings={settings} />
        </AuthProvider>
      </body>
    </html>
  );
}
