# Installation Guide — Global Cabs Platform

## Prerequisites

- Node.js ≥ 18 (LTS recommended)
- MongoDB ≥ 6 (local or MongoDB Atlas)
- Cloudinary account (free tier works) — for image uploads
- SMTP credentials (Gmail App Password / SES / any SMTP) — for emails *(optional in dev)*
- Twilio **or** Fast2SMS account — for SMS *(optional)*

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/globalcabs
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# Email (skipped silently if unset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="The Global Cabs <bookings@theglobalcabs.com>"

# SMS: twilio | fast2sms | none
SMS_PROVIDER=none
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
FAST2SMS_API_KEY=

# Company (used in emails/invoices)
COMPANY_NAME=The Global Cabs
COMPANY_PHONE=+91 7827313298
COMPANY_EMAIL=theglobalcabs@gmail.com
COMPANY_ADDRESS=Gurugram, Haryana, India
```

Seed demo data (admin user, 5 vehicles, 8 routes, 18 fare rules at live-site prices, CMS pages, blogs, testimonials):

```bash
npm run seed
```

Run:

```bash
npm run dev      # nodemon
# or
npm start        # production
```

Health check: `GET http://localhost:5000/api/health`

**Default admin:** `admin@theglobalcabs.com` / `admin123` — **change the password immediately in production** (Admin → Users, or via dashboard profile).

---

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run:

```bash
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

---

## 3. Production deployment (VPS + PM2)

```bash
npm install -g pm2

# Backend
cd backend && npm install --production
pm2 start server.js --name gc-api

# Frontend
cd ../frontend && npm install && npm run build
pm2 start npm --name gc-web -- start

pm2 save && pm2 startup
```

### Nginx reverse proxy

```nginx
server {
    server_name theglobalcabs.com www.theglobalcabs.com;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

Then set in production env:
- backend `.env`: `CLIENT_URL=https://theglobalcabs.com`, `NODE_ENV=production`
- frontend `.env.local`: `NEXT_PUBLIC_API_URL=https://theglobalcabs.com` (same origin via Nginx) and `NEXT_PUBLIC_SITE_URL=https://theglobalcabs.com`

Add SSL with certbot: `sudo certbot --nginx -d theglobalcabs.com -d www.theglobalcabs.com`

---

## 4. Post-install checklist

1. Log into `/admin` and change the admin password.
2. Admin → Settings: confirm phone, WhatsApp, email, tax %, cancellation window.
3. Admin → Vehicles / Routes / Fares: upload real photos, adjust pricing.
4. Admin → SEO: add per-page overrides as needed (sitemap/robots are automatic).
5. Configure SMTP + SMS provider and place a test booking end-to-end.
6. Verify invoice PDF download from the customer dashboard.

## Troubleshooting

| Issue | Fix |
|---|---|
| Images fail to upload | Check Cloudinary credentials; 5 MB/file limit |
| Emails not sending | Use Gmail App Password (not account password); check SMTP_PORT 587 |
| `route+vehicle` duplicate error | A fare rule already exists for that pair — edit it instead |
| CORS errors | Ensure `CLIENT_URL` in backend `.env` matches the frontend origin |
| Booking SMS silent | `SMS_PROVIDER=none` skips SMS by design — set twilio/fast2sms |
