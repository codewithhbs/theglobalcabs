/* CMS pages seed — SAFE: sirf CMS pages create/update karta hai (slug ke basis par upsert).
   Kuch delete nahi hota, baaki data (users, bookings, vehicles, blogs...) untouched.
   Run: npm run seed:cms
   Content: src/seed/cms-content/<slug>.html  ([faqs] = jahan FAQ section dikhana hai) */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Page = require('../models/Page');
const Settings = require('../models/Settings');

const NEW_ADDRESS = 'H No 111, G. F, Shiva Enclave, Part - 1, Garhi Harsaru, Gurugram, Haryana 122505';

const PAGES = [
  {
    "slug": "car-rental-service-in-gurgaon",
    "title": "Car Rental Service in Gurgaon with Verified Drivers and Fixed Fares",
    "metaTitle": "Car Rental service in Gurgaon | Corporate, Luxury & Airport",
    "metaDescription": "Book car rental services in Gurgaon with The Global Cabs. Choose luxury and chauffeur-driven cars for airport transfers, daily travel and outstation trips.",
    "focusKeyword": "Car Rental service in Gurgaon",
    "faqs": [
      {
        "question": "How do I book a car rental in Gurgaon with The Global Cabs?",
        "answer": "Share your pickup point, destination, travel date and number of passengers. We will suggest the right car and confirm your booking with driver and vehicle details before pickup."
      },
      {
        "question": "Do you offer car rental with a driver in Gurgaon?",
        "answer": "Yes. Every car rental comes with a professional chauffeur who knows the city’s routes and busy hours."
      },
      {
        "question": "Can I rent a car for an outstation trip from Gurgaon?",
        "answer": "Yes. We offer one-way and return outstation trips to destinations such as Jaipur, Agra, Chandigarh and Haridwar."
      },
      {
        "question": "Which cars can I choose for car rental in Gurgaon?",
        "answer": "You can choose from sedans, SUVs and luxury cars, depending on your group size, luggage and journey."
      },
      {
        "question": "Do you provide airport transfers from Gurgaon?",
        "answer": "Yes. We offer pickups and drops to Indira Gandhi International Airport in Delhi, with a suggested pickup time that allows for traffic."
      }
    ]
  },
  {
    "slug": "cab-service-in-gurgaon",
    "title": "Cab Service in Gurgaon – Reliable and Comfortable Rides with The Global Cabs",
    "metaTitle": "Cab Service in Gurgaon | Reliable Taxi Booking – The Global Cabs",
    "metaDescription": "Need a reliable cab service in Gurgaon? Book comfortable cabs with The Global Cabs for local rides, airport transfers and outstation travel. Fixed fares, 24x7.",
    "focusKeyword": "Cab Service in Gurgaon",
    "faqs": [
      {
        "question": "How do I book a cab in Gurgaon with The Global Cabs?",
        "answer": "You can book a cab by calling or messaging us. Tell us where you would like to be picked up from, where you need to go and when. We’ll confirm your details and provide you with driver and vehicle information."
      },
      {
        "question": "Do you offer airport taxi services in Gurgaon?",
        "answer": "Yes! We offer pickups and drops to Delhi airport at any time of day. Our drivers will plan your journey to avoid delays due to traffic."
      },
      {
        "question": "Can I book a cab for outstation journeys?",
        "answer": "Yes! We offer one-way and return journeys to popular destinations such as Jaipur, Agra, Chandigarh and Haridwar."
      },
      {
        "question": "Are your prices fixed?",
        "answer": "We will always let you know how much your journey will cost before confirming. Any extra charges, such as tolls or extra hours, will be given to you in advance."
      },
      {
        "question": "What vehicles do you have?",
        "answer": "There are a variety of vehicles to choose from: sedans, SUVs and luxury cars, depending on how many people you have, how much luggage you have and what type of journey you are making."
      },
      {
        "question": "Do you offer corporate services?",
        "answer": "Yes! We provide services to businesses for employee pickups, client pickups and airport drops. We can provide flexible options."
      }
    ]
  },
  {
    "slug": "taxi-service-in-gurgaon",
    "title": "24/7 Taxi Service in Gurgaon for Airport, Local and Outstation Trips",
    "metaTitle": "Taxi Service in Gurgaon | The Global Cabs Gurgaon",
    "metaDescription": "Book reliable taxi service in Gurgaon with The Global Cabs for local rides, airport transfers, outstation trips, and convenient corporate cab services. Book Now",
    "focusKeyword": "Taxi Service in Gurgaon",
    "faqs": [
      {
        "question": "How can I book a taxi in Gurgaon?",
        "answer": "Contact The Global Cabs to book a taxi. Let us know where you need to be picked up and dropped off, choose your vehicle and we can book your journey."
      },
      {
        "question": "Do you provide airport taxi services in Gurgaon?",
        "answer": "Yes, we can help with airport transfers. We can help with taxi journeys from Gurgaon to Delhi airport."
      },
      {
        "question": "Can I book an outstation taxi?",
        "answer": "Yes, we can help with outstation taxi services. We can help with family trips, holidays and business journeys. We can talk through one-way and return journeys."
      },
      {
        "question": "Are the prices fixed?",
        "answer": "Prices depend on vehicle, distance and type of journey. Contact The Global Cabs to confirm our prices."
      },
      {
        "question": "What types of vehicles do you have?",
        "answer": "We have sedans, SUVs and luxury cars available. This will depend on the date, route and requirements."
      },
      {
        "question": "Do you provide corporate taxi services?",
        "answer": "Yes, we can help with corporate transport. We can help with staff and client pickups, business meetings and airport transfers."
      }
    ]
  }
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding CMS pages...');

  for (const p of PAGES) {
    const content = fs.readFileSync(path.join(__dirname, 'cms-content', `${p.slug}.html`), 'utf8').replace(/\r/g, '').trim();
    const data = {
      title: p.title,
      slug: p.slug,
      content,
      faqs: p.faqs,
      status: 'active',
      seo: { metaTitle: p.metaTitle, metaDescription: p.metaDescription, focusKeyword: p.focusKeyword, keywords: [p.focusKeyword], noIndex: false },
    };
    const existing = await Page.findOne({ slug: p.slug });
    if (existing) { existing.set(data); await existing.save(); console.log(`  updated  /${p.slug}`); }
    else { await Page.create(data); console.log(`  created  /${p.slug}`); }
  }

  // Office address change (footer + contact page settings se aate hain) — sirf agar abhi purana/default hai
  const settings = await Settings.findOne();
  if (!settings) await Settings.create({ address: NEW_ADDRESS });
  else if (!settings.address || settings.address.trim() === 'Gurugram, Haryana, India') {
    settings.address = NEW_ADDRESS; await settings.save(); console.log('  settings address updated');
  }

  console.log('CMS seed complete.');
  await mongoose.disconnect();
};

run().catch((e) => { console.error(e); process.exit(1); });
