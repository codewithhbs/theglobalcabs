# Global Cabs — Cab Booking & Route Management Platform

Production-ready full-stack platform for **theglobalcabs.com** (Gurugram, Delhi NCR) — public website, customer dashboard, and a 13-module admin panel.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router, JavaScript), Tailwind CSS, Context API |
| Backend | Node.js + Express, REST API (`/api/v1`) |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookie + Bearer token), role-based (customer/admin) |
| Uploads | Multer + Cloudinary |
| Email | Nodemailer (branded HTML templates) |
| SMS | Pluggable — Twilio / Fast2SMS / none |
| Invoices | PDFKit (streamed branded PDF) |
| Payments | Payment-ready architecture (`booking.payment` subdoc — plug in Razorpay/Stripe) |

## Features

**Public website** — Home with live fare calculator, About, 6 service pages, Fleet + vehicle details, Routes + per-vehicle fare tables, Fare Calculator, Blog, Contact, FAQ, Privacy/Terms/Cancellation (CMS-driven), full SEO (dynamic meta from admin, JSON-LD TaxiService + FAQ schema, sitemap.xml, robots.txt).

**Customer** — Register/login, instant fare quote with breakdown (seasonal/festival/peak-hour/coupon/tax), guest or logged-in booking with email + SMS confirmation, dashboard (upcoming trips, history with filters, one-tap cancel inside policy window, PDF invoice download, profile & password).

**Admin panel (13 modules)** — Dashboard analytics (revenue, 6-month trend, status breakdown), Bookings (status workflow, driver/vehicle assignment, invoice, CSV export), Routes, Fares (fixed/per-km + seasonal windows + peak hours) & Coupons, Vehicles (5 categories, multi-image), Drivers (photo + documents), Users, Blog, Testimonials, CMS pages (with FAQ editor), Contact Inquiries, SEO overrides, Settings (tax %, cancellation window, peak hours, company info).

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill MONGO_URI, JWT_SECRET (others optional for dev)
npm install
npm run seed                # demo data + admin user
npm run dev                 # http://localhost:5000

# 2. Frontend
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

**Default admin:** `admin@theglobalcabs.com` / `admin123` → http://localhost:3000/admin

Full setup (production, PM2, Cloudinary, SMS): see [`docs/INSTALLATION.md`](docs/INSTALLATION.md)
API reference: see [`docs/API.md`](docs/API.md)

## Project structure

```
global-cabs/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/        # db, cloudinary
│       ├── models/        # 12 Mongoose models
│       ├── controllers/   # 15 controllers + generic factory
│       ├── routes/        # 14 route files (/api/v1/*)
│       ├── middleware/    # auth, upload, errorHandler
│       ├── utils/         # fareEngine, invoice (PDF), email, sms, apiFeatures
│       └── seed/          # demo data matching live-site pricing
├── frontend/
│   ├── app/               # public pages + /dashboard + /admin
│   ├── components/        # UI + admin/ResourceManager + dashboard
│   ├── context/           # AuthContext
│   └── lib/               # api client, seo helpers, constants
└── docs/                  # INSTALLATION.md, API.md
```
