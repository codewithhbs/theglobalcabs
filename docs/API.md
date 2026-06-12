# API Reference — Global Cabs

Base URL: `https://server.globalcabs.adsdigitalmedia.com/api/v1`

- **Auth:** `Authorization: Bearer <token>` header (token also set as httpOnly cookie on login).
- **Roles:** 🔓 public · 👤 customer (logged in) · 🛡 admin only.
- **List endpoints** support `?page=&limit=&sort=&fields=&search=` plus direct field filters (e.g. `?status=active&category=airport`). Response: `{ status, results, total, page, pages, data }`.
- Errors: `{ status: 'fail'|'error', message }` with appropriate HTTP codes.

---

## Auth — `/auth`

| Method | Path | Access | Body / Notes |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | `{ name, email, phone, password }` → `{ token, data.user }` |
| POST | `/auth/login` | 🔓 | `{ email, password }` → `{ token, data.user }` |
| POST | `/auth/logout` | 🔓 | Clears cookie |
| GET | `/auth/me` | 👤 | Current user |
| PATCH | `/auth/me` | 👤 | `{ name?, email?, phone? }` + optional `avatar` file (multipart) |
| PATCH | `/auth/update-password` | 👤 | `{ currentPassword, newPassword }` → new token |

## Users — `/users` 🛡

| Method | Path | Notes |
|---|---|---|
| GET | `/users` | List (search: name/email/phone) |
| POST | `/users` | Create customer/admin: `{ name, email, phone, password, role }` |
| GET/PATCH/DELETE | `/users/:id` | Manage user |

## Routes — `/routes`

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/routes` | 🔓 | Filters: `category`, `isPopular`, `status` |
| GET | `/routes/detail/:slug` | 🔓 | `{ route, fares[] }` — fares populated with vehicle |
| GET | `/routes/:idOrSlug` | 🔓 | Single route |
| POST | `/routes` | 🛡 | Multipart; fields + `image` file. `seo` may be JSON string |
| PATCH/DELETE | `/routes/:id` | 🛡 | |

Route fields: `pickupLocation, dropLocation, distanceKm, estimatedTime, category(oneWay|roundTrip|airport|railway|local|outstation), isPopular, status, description, image, seo{metaTitle,metaDescription}`. `name` + `slug` auto-generated.

## Vehicles — `/vehicles`

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/vehicles` | 🔓 | Filter: `category`, `status` |
| GET | `/vehicles/:idOrSlug` | 🔓 | |
| POST | `/vehicles` | 🛡 | Multipart; `images` up to 6 files |
| PATCH/DELETE | `/vehicles/:id` | 🛡 | PATCH merges new images; send `keepImages` JSON to prune |

Vehicle fields: `name, category(Hatchback|Sedan|SUV|MUV|Luxury), seatingCapacity, luggageCapacity, perKmRate, minimumFare, features[], description, status`.

## Drivers — `/drivers` 🛡

| Method | Path | Notes |
|---|---|---|
| GET | `/drivers` | Populated `assignedVehicle`; search name/phone/license |
| POST | `/drivers` | Multipart; `photo` (1) + `documents` (≤5, image/pdf) |
| GET/PATCH/DELETE | `/drivers/:id` | |

Driver fields: `name, phone, email, licenseNumber, experienceYears, assignedVehicle, availability(available|onTrip|offDuty), status, address`.

## Fares — `/fares`

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/fares/calculate` | 🔓 | See below |
| GET | `/fares` | 🛡 | Rules populated with route+vehicle |
| POST | `/fares` | 🛡 | One rule per `(route, vehicle)` — unique |
| GET/PATCH/DELETE | `/fares/:id` | 🛡 | |
| GET | `/fares/coupons` | 🛡 | |
| POST | `/fares/coupons` | 🛡 | `{ code, type(flat|percent), value, maxDiscount?, minBookingAmount?, validFrom?, validTo?, usageLimit?, status }` |
| PATCH/DELETE | `/fares/coupons/:id` | 🛡 | |

### Fare calculation — `POST /fares/calculate` 🔓

```json
{
  "routeId": "…",            // OR distanceKm for custom trips
  "vehicleId": "…",          // required
  "distanceKm": 240,
  "date": "2026-06-20",
  "time": "23:30",
  "tripType": "oneWay",      // roundTrip doubles distance fare
  "couponCode": "WELCOME10"
}
```

Response `data.fare`:

```json
{
  "base": 1900,
  "breakdown": [
    { "label": "Base fare (fixed)", "amount": 1900 },
    { "label": "Peak hour (+10%)", "amount": 190 },
    { "label": "Coupon WELCOME10", "amount": -209 },
    { "label": "Tax (5%)", "amount": 94 }
  ],
  "subtotal": 1881,
  "tax": 94,
  "discount": 209,
  "total": 1975
}
```

Pricing engine order: fixed/per-km base → round-trip ×2 → seasonal/festival windows (flat/percent, date-range) → peak hours (time-range, supports overnight spans) → coupon → tax (Settings.taxPercent).

## Bookings — `/bookings`

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/bookings` | 🔓/👤 | Guest (`name/email/phone` in body) or logged-in. Calculates fare server-side, sends email+SMS confirmation |
| GET | `/bookings/my` | 👤 | Own bookings; `?upcoming=true` for future confirmed/pending |
| PATCH | `/bookings/my/:id/cancel` | 👤 | Enforces `cancellationWindowHours` from Settings |
| GET | `/bookings/:id/invoice` | 👤/🛡 | Streams branded PDF (owner or admin) |
| GET | `/bookings` | 🛡 | All; populated customer/vehicle/driver |
| GET | `/bookings/export/csv` | 🛡 | CSV download |
| GET/PATCH/DELETE | `/bookings/:id` | 🛡 | PATCH `{ status?, driver?, vehicle?, adminNotes? }` — status changes notify customer |

Create body:

```json
{
  "routeId": "…",                  // or pickupLocation/dropLocation + distanceKm
  "vehicleId": "…",
  "pickupLocation": "Gurugram",
  "dropLocation": "IGI Airport T3",
  "pickupDate": "2026-06-20", "pickupTime": "04:30",
  "tripType": "airport", "passengers": 2,
  "couponCode": "WELCOME10", "notes": "Flight AI-302",
  "name": "Guest Name", "email": "g@x.com", "phone": "+91…"   // guests only
}
```

Statuses: `pending → confirmed → ongoing → completed`, or `cancelled`. Every change appended to `statusHistory[]`. `bookingId` auto-format `GC2026xxxxx`. `payment` subdoc (`method, status, transactionId`) is ready for gateway integration.

## Blogs — `/blogs`

🔓 `GET /blogs` (filter `status=published`, `category`), `GET /blogs/:slug` (increments views) · 🛡 `POST` (multipart `coverImage`), `PATCH`, `DELETE`.

## Testimonials — `/testimonials`

🔓 `GET` · 🛡 `POST` (multipart `avatar`), `PATCH`, `DELETE`. Fields: `name, designation, rating(1-5), message, status`.

## Contact — `/contact`

🔓 `POST /contact` `{ name, phone, message, email?, subject? }` (notifies admin email) · 🛡 `GET`, `PATCH /:id` `{ status(new|inProgress|resolved), adminNote }`, `DELETE /:id`.

## CMS — `/cms/pages`

🔓 `GET /cms/pages`, `GET /cms/pages/:idOrSlug` · 🛡 `POST`, `PATCH`, `DELETE`. Fields: `title, slug(auto), content(HTML), faqs[{question,answer}], status, seo{}`.

Seeded slugs: `about`, `privacy-policy`, `terms-and-conditions`, `cancellation-policy`, `faq`.

## SEO — `/seo`

🔓 `GET /seo/resolve?path=/fleet` → meta override for path · 🛡 `GET /seo`, `POST`, `PATCH /:id`, `DELETE /:id`. Fields: `path, metaTitle, metaDescription, keywords[], ogTitle, ogDescription, ogImage, canonical, noIndex, schemaMarkup(JSON-LD string)`.

## Settings — `/settings`

🔓 `GET /settings` (singleton) · 🛡 `PATCH /settings` (multipart `logo` optional). Fields: company info, `social{}`, `taxPercent`, `peakHours{}`, `cancellationWindowHours`, `announcement`.

## Dashboard — `/dashboard` 🛡

`GET /dashboard/stats` →

```json
{
  "totals": { "bookings", "monthBookings", "pendingBookings", "revenue", "activeRoutes", "activeDrivers", "vehicles", "customers" },
  "recentBookings": [ … 8 latest … ],
  "statusCounts": { "pending": 3, "confirmed": 5, … },
  "monthly": [ { "month": "1/2026", "bookings": 42, "revenue": 68400 }, … ]
}
```

---

## Misc

- `GET /api/health` → `{ status: 'ok' }`
- Rate limit: 500 req / 15 min / IP on `/api`
- Security: helmet, CORS (CLIENT_URL), mongo-sanitize, compression
- Frontend SEO: `sitemap.xml` and `robots.txt` generated by Next.js from live routes/blogs/vehicles
