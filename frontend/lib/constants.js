export const TRIP_TYPES = [
  { value: 'oneWay', label: 'One Way' },
  { value: 'roundTrip', label: 'Round Trip' },
  { value: 'local', label: 'Local Rental' },
  { value: 'airport', label: 'Airport Transfer' },
  { value: 'railway', label: 'Railway Transfer' },
  { value: 'outstation', label: 'Outstation' },
];

export const SERVICES = [
  {
    slug: 'local-taxi',
    title: 'Local Taxi',
    short: 'Hourly rental packages (8hr/80km) for meetings, shopping and city errands across Gurugram & Delhi NCR.',
    icon: 'city',
    body: 'Hire a cab with driver for the full day. Our 8 hours / 80 km local rental covers Gurugram and Delhi NCR — perfect for back-to-back meetings, shopping runs, family functions or hospital visits. Extra hours and kilometres are billed transparently as per actuals.',
  },
  {
    slug: 'outstation-taxi',
    title: 'Outstation Taxi',
    short: 'Comfortable intercity travel to Jaipur, Agra, Chandigarh, Haridwar and 50+ destinations.',
    icon: 'mountain',
    body: 'Travel anywhere in North India with experienced highway drivers, well-maintained cars and round-the-clock support. Choose one-way drops or multi-day round trips with flexible itineraries.',
  },
  {
    slug: 'airport-transfer',
    title: 'Airport Transfer',
    short: 'Fixed-fare pickups and drops for IGI Airport (T1, T2, T3) — on time, every time, 24x7.',
    icon: 'plane',
    body: 'Never miss a flight. We track your flight timing, plan around NH-48 traffic and guarantee on-time pickups for all IGI terminals. Fixed fares, no surge, with meet-and-greet available on request.',
  },
  {
    slug: 'one-way-taxi',
    title: 'One Way Taxi',
    short: 'Pay only for one side — affordable single-direction drops to 50+ cities.',
    icon: 'arrow',
    body: 'Why pay for a round trip when you travel one way? Our one-way taxi service offers single-direction fares to popular destinations, with transparent per-km pricing and zero return charges.',
  },
  {
    slug: 'round-trip-taxi',
    title: 'Round Trip Taxi',
    short: 'Multi-day trips with the same car and driver — your itinerary, your pace.',
    icon: 'loop',
    body: 'Keep the cab for the entire journey. Ideal for weekend getaways, pilgrimage circuits and business tours — the same trusted driver stays with you for the full trip.',
  },
  {
    slug: 'corporate-cab-services',
    title: 'Corporate Cab Services',
    short: 'Employee transport, guest pickups and monthly billing for businesses in Gurugram.',
    icon: 'briefcase',
    body: 'Dedicated account management, GST invoicing, monthly consolidated billing and a verified driver pool for your team and visiting clients. Trusted by businesses across Cyber City and Udyog Vihar.',
  },
];

export const WHY_US = [
  { title: 'Fixed, Transparent Fares', desc: 'The price you see is the price you pay. Full fare breakdown before you book — no surge, no surprises.' },
  { title: 'Verified Drivers', desc: 'Police-verified, trained chauffeurs with years of highway and city driving experience.' },
  { title: '24x7 Availability', desc: 'Late-night flight? Early-morning train? We operate round the clock, every day of the year.' },
  { title: 'Clean, Sanitized Cars', desc: 'Every vehicle is inspected and cleaned before each trip, with AC and GPS as standard.' },
  { title: 'Instant Confirmation', desc: 'Booking confirmation by SMS and email within seconds, with driver details before pickup.' },
  { title: 'Easy Cancellation', desc: 'Plans change. Cancel free up to 4 hours before pickup, right from your dashboard.' },
];
