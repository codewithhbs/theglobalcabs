/* Seed script: creates admin, vehicles, routes, fare rules, testimonials, CMS pages, settings.
   Run: npm run seed */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const FareRule = require('../models/FareRule');
const Testimonial = require('../models/Testimonial');
const Page = require('../models/Page');
const Settings = require('../models/Settings');
const Blog = require('../models/Blog');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([
    User.deleteMany(), Vehicle.deleteMany(), Route.deleteMany(),
    FareRule.deleteMany(), Testimonial.deleteMany(), Page.deleteMany(),
    Settings.deleteMany(), Blog.deleteMany(),
  ]);

  await User.create({
    name: 'Admin', email: 'admin@theglobalcabs.com', phone: '+917827313298',
    password: 'admin123', role: 'admin',
  });

  const vehicles = await Vehicle.create([
    { name: 'WagonR', category: 'Hatchback', seatingCapacity: 4, luggageCapacity: 2, perKmRate: 12, minimumFare: 300, fuelType: 'CNG', features: ['AC', 'Music System', 'GPS Tracking'], description: 'Compact and economical — ideal for city rides and quick airport drops.' },
    { name: 'Swift Dzire', category: 'Sedan', seatingCapacity: 4, luggageCapacity: 3, perKmRate: 13, minimumFare: 350, fuelType: 'CNG', features: ['AC', 'Music System', 'GPS Tracking', 'Charging Port'], description: 'India\'s most trusted sedan for comfortable one-way and outstation trips.' },
    { name: 'Ertiga', category: 'MUV', seatingCapacity: 6, luggageCapacity: 4, perKmRate: 16, minimumFare: 500, fuelType: 'CNG', features: ['AC', 'Music System', 'GPS Tracking', 'Spacious Boot'], description: 'Roomy 6+1 seater for family trips and group airport transfers.' },
    { name: 'Innova Crysta', category: 'SUV', seatingCapacity: 6, luggageCapacity: 5, perKmRate: 22, minimumFare: 800, fuelType: 'Diesel', features: ['AC', 'Premium Interiors', 'GPS Tracking', 'Captain Seats'], description: 'Premium comfort for long outstation journeys and corporate travel.' },
    { name: 'Mercedes E-Class', category: 'Luxury', seatingCapacity: 4, luggageCapacity: 3, perKmRate: 60, minimumFare: 3000, fuelType: 'Petrol', features: ['Premium Leather', 'Chauffeur Service', 'WiFi', 'Refreshments'], description: 'Arrive in style — luxury chauffeur-driven rides for VIP and corporate clients.' },
  ]);
  const [wagonr, dzire, ertiga, innova] = vehicles;

  const routes = await Route.create([
    { pickupLocation: 'Gurugram', dropLocation: 'Delhi Airport (IGI T3)', distanceKm: 28, estimatedTime: '45 min', category: 'airport', isPopular: true, description: 'Fixed-fare transfers between Gurugram and Indira Gandhi International Airport, all terminals.' },
    { pickupLocation: 'Gurugram', dropLocation: 'New Delhi Railway Station', distanceKm: 32, estimatedTime: '1 hr 10 min', category: 'railway', isPopular: true, description: 'On-time pickups and drops for New Delhi Railway Station, day and night.' },
    { pickupLocation: 'Gurugram', dropLocation: 'Anand Vihar Terminal', distanceKm: 45, estimatedTime: '1 hr 30 min', category: 'railway', isPopular: true },
    { pickupLocation: 'Gurugram', dropLocation: 'Jaipur', distanceKm: 240, estimatedTime: '4 hr 30 min', category: 'oneWay', isPopular: true, description: 'Comfortable one-way drops to the Pink City with experienced highway drivers.' },
    { pickupLocation: 'Gurugram', dropLocation: 'Agra', distanceKm: 220, estimatedTime: '3 hr 45 min', category: 'oneWay', isPopular: true },
    { pickupLocation: 'Gurugram', dropLocation: 'Chandigarh', distanceKm: 250, estimatedTime: '4 hr 45 min', category: 'oneWay', isPopular: true },
    { pickupLocation: 'Gurugram', dropLocation: 'Haridwar', distanceKm: 230, estimatedTime: '5 hr', category: 'oneWay' },
    { pickupLocation: 'Gurugram', dropLocation: 'Local Rental (8hr / 80km)', distanceKm: 80, estimatedTime: '8 hours', category: 'local', isPopular: true, description: 'Full-day local rental within Gurugram & Delhi NCR — 8 hours / 80 km package.' },
  ]);
  const [airport, ndls, anand, jaipur, , , , local] = routes;

  await FareRule.create([
    { route: airport._id, vehicle: wagonr._id, fareType: 'fixed', fixedFare: 900 },
    { route: airport._id, vehicle: dzire._id, fareType: 'fixed', fixedFare: 1000 },
    { route: airport._id, vehicle: ertiga._id, fareType: 'fixed', fixedFare: 1600 },
    { route: airport._id, vehicle: innova._id, fareType: 'fixed', fixedFare: 1900 },
    { route: ndls._id, vehicle: wagonr._id, fareType: 'fixed', fixedFare: 1000 },
    { route: ndls._id, vehicle: dzire._id, fareType: 'fixed', fixedFare: 1200 },
    { route: ndls._id, vehicle: ertiga._id, fareType: 'fixed', fixedFare: 1600 },
    { route: ndls._id, vehicle: innova._id, fareType: 'fixed', fixedFare: 1900 },
    { route: anand._id, vehicle: wagonr._id, fareType: 'fixed', fixedFare: 1200 },
    { route: anand._id, vehicle: dzire._id, fareType: 'fixed', fixedFare: 1300 },
    { route: anand._id, vehicle: ertiga._id, fareType: 'fixed', fixedFare: 1700 },
    { route: anand._id, vehicle: innova._id, fareType: 'fixed', fixedFare: 2000 },
    { route: local._id, vehicle: wagonr._id, fareType: 'fixed', fixedFare: 1500 },
    { route: local._id, vehicle: dzire._id, fareType: 'fixed', fixedFare: 1600 },
    { route: local._id, vehicle: ertiga._id, fareType: 'fixed', fixedFare: 2000 },
    { route: local._id, vehicle: innova._id, fareType: 'fixed', fixedFare: 2500 },
    { route: jaipur._id, vehicle: dzire._id, fareType: 'perKm', perKmRate: 13, minimumFare: 2800 },
    { route: jaipur._id, vehicle: innova._id, fareType: 'perKm', perKmRate: 22, minimumFare: 4800 },
  ]);

  await Testimonial.create([
    { name: 'Rohit Sharma', designation: 'Frequent Flyer', rating: 5, message: 'Booked a 4 AM airport pickup — driver arrived 10 minutes early. Clean car, fixed price, zero stress.' },
    { name: 'Priya Mehta', designation: 'Corporate Client', rating: 5, message: 'We use Global Cabs for all our office guest transfers in Gurugram. Reliable every single time.' },
    { name: 'Aman Verma', designation: 'Family Traveller', rating: 5, message: 'Took the Innova to Jaipur with family. Courteous driver, smooth highway driving, very fair pricing.' },
    { name: 'Sneha Kapoor', designation: 'Solo Traveller', rating: 4, message: 'Felt completely safe travelling alone at night. Live updates and a verified driver made all the difference.' },
  ]);

  await Page.create([
    { title: 'About Us', slug: 'about', content: '<p>The Global Cabs is Gurugram\'s trusted cab service for airport transfers, railway pickups, local rentals and outstation trips across North India. With a modern fleet, verified drivers and transparent fixed pricing, we have completed thousands of journeys safely.</p>' },
    { title: 'Privacy Policy', slug: 'privacy-policy', content: '<p>We collect only the information needed to complete your booking — name, phone, email and trip details. We never sell your data to third parties. Payment details are processed securely by our payment partners and are never stored on our servers.</p>' },
    { title: 'Terms & Conditions', slug: 'terms-and-conditions', content: '<p>Fares include vehicle and driver charges. Toll, state tax, parking and night allowance are payable as per actuals unless stated otherwise. Waiting beyond 45 minutes may attract additional charges. The company reserves the right to assign an equivalent vehicle category when required.</p>' },
    { title: 'Cancellation Policy', slug: 'cancellation-policy', content: '<p>Free cancellation up to 4 hours before pickup. Cancellations within 4 hours of pickup may attract a fee of up to 25% of the fare. No-shows are charged the minimum fare. Refunds for online payments are processed within 5–7 business days.</p>' },
    {
      title: 'FAQ', slug: 'faq', content: '<p>Frequently asked questions about booking with The Global Cabs.</p>',
      faqs: [
        { question: 'How do I book a cab?', answer: 'Use the booking form on our homepage, call us, or message us on WhatsApp. You\'ll receive instant confirmation by SMS and email.' },
        { question: 'Are tolls and taxes included in the fare?', answer: 'Fixed route fares show a transparent breakdown. Toll, state tax and parking are payable as per actuals unless mentioned otherwise.' },
        { question: 'Can I cancel my booking?', answer: 'Yes — cancellation is free up to 4 hours before your pickup time, directly from your dashboard.' },
        { question: 'Do you operate at night?', answer: 'Yes, we operate 24x7 including late-night and early-morning airport transfers. Night charges may apply.' },
        { question: 'Are your drivers verified?', answer: 'Every driver is police-verified with valid commercial licenses and undergoes our in-house training.' },
      ],
    },
  ]);

  await Blog.create([
    { title: '10 Tips for a Stress-Free Airport Transfer from Gurugram', excerpt: 'Beat NH-48 traffic and never miss a flight again with these practical tips.', content: '<p>Leaving for IGI Airport from Gurugram? Plan around peak NH-48 hours (8–11 AM, 5–9 PM), book a fixed-fare cab the night before, and keep a 45-minute buffer for security lines...</p>', status: 'published', tags: ['airport', 'travel-tips'], category: 'Travel Tips' },
    { title: 'Gurugram to Jaipur by Road: The Complete Guide', excerpt: 'Route, stops, timing and what a one-way cab really costs.', content: '<p>The 240 km drive via NH-48 takes about 4.5 hours. Best halts: Behror Midway for breakfast, Shahpura for chai. A one-way sedan starts around ₹13/km...</p>', status: 'published', tags: ['outstation', 'jaipur'], category: 'Routes' },
  ]);

  await Settings.create({});

  console.log('✅ Seed complete.');
  console.log('   Admin login: admin@theglobalcabs.com / admin123');
  await mongoose.disconnect();
};

run().catch((e) => { console.error(e); process.exit(1); });
