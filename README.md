# Explore Bound Holidays 🌍✈️

An immersive, fully dynamic travel website for **Explore Bound Holidays** — domestic & international tour packages, group departures, online booking, reviews and an admin panel, wrapped in a cinematic 3D design.

Built with **Next.js 16 (App Router) · React 19 · Three.js / React Three Fiber · Tailwind CSS 4 · Motion · Drizzle ORM · SQLite / libSQL (Turso)**.

---

## ✨ Highlights

| | Feature | Where |
|---|---|---|
| 1 | **Interactive 3D globe** — dotted Earth, glowing pins, animated flight arcs from India, orbiting paper plane. Drag to spin, click a pin to open the destination | Home, `/destinations`, package & destination pages |
| 2 | **Smart search** — instant suggestions (⌘K palette + hero search) and filters for type, destination, style, duration, budget, group tours, sorting | `/packages` |
| 3 | **Online booking engine** — hotel tiers, departure seats, travellers, add-ons, live price + GST, 25% advance, booking reference | `/book/[slug]` |
| 4 | **Manage my booking** — status timeline, payment state, itinerary download | `/my-booking` |
| 5 | **Click-to-call, WhatsApp chat & callback scheduler** | Floating buttons, `/contact` |
| 6 | **Custom trip planner** with a live 3D boarding pass | `/plan-my-trip` |
| 7 | **Fixed-departure group tours** with live seat counters | `/group-tours` |
| 8 | **Reviews & ratings** (moderated), 3D testimonial carousel, NPS feedback form | Home, `/reviews` |
| 9 | **Wishlist** (♥) and **package comparison** (up to 3, side by side) | `/wishlist`, `/compare` |
| 10 | **Multi-currency** prices — INR, USD, EUR, GBP, AED | Navbar |
| 11 | **Printable / PDF itinerary** | `/itinerary/[slug]` |
| 12 | **Flash deals** with live countdown timers | Home, package cards |
| 13 | **Trip assistant chatbot** — understands destinations, budgets, durations, visas, payments | Floating bot button |
| 14 | **EMI calculator**, best-time / weather / visa info, mini globe | Package pages |
| 15 | **Recently viewed**, share buttons, newsletter | Site-wide |
| 16 | **Admin panel** — dashboard, bookings, leads, review moderation, feedback, package & itinerary editor, departures, destinations, subscribers CSV | `/admin` |
| 17 | **SEO** — metadata, Open Graph, JSON-LD (TravelAgency, FAQ, TouristTrip), sitemap, robots, manifest | — |

Animations: smooth scrolling (Lenis), scroll reveals, 3D tilt cards with glare, a 3D destination wall, parallax hero and more — all respecting *reduced motion* settings.

---

## 🚀 Run it locally

```bash
npm install
cp .env.example .env      # optional — sensible defaults are built in
npm run dev               # creates + seeds the SQLite database automatically
```

Open <http://localhost:3000>. Admin panel: <http://localhost:3000/admin>
(dev login: `admin@explorebound.com` / `explore@123` — **set your own in `.env` before going live**).

| Command | What it does |
|---|---|
| `npm run db:setup` | Migrate + seed if empty (runs automatically before `dev` / `build`) |
| `npm run db:reset` | Wipe and reseed |
| `npm run db:reset -- --no-demo` | Reseed **without** sample reviews / bookings / enquiries |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run typecheck` | TypeScript check |

---

## ☁️ Deploying

### Vercel
Deploys with zero config. **Without `DATABASE_URL` it runs in demo mode**: each server instance creates and seeds its own SQLite file in `/tmp`, so new bookings and reviews are temporary.

For a permanent database, create a free [Turso](https://turso.tech) database and set these environment variables:

```
DATABASE_URL=libsql://<your-db>.turso.io
DATABASE_AUTH_TOKEN=<token>
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
AUTH_SECRET=<long random string>
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Tables are created and seeded automatically on first start (`src/instrumentation.ts`).

### Any Node host (VPS, Hostinger, Render…)
`npm run build && npm start` — the SQLite file in `./data/` persists on disk.

---

## ✏️ Make it yours

- **Contact details, stats & social links:** `src/lib/site.ts` (phone, WhatsApp, email and address are placeholders).
- **Packages, destinations, departures, reviews:** manage everything from `/admin`, or edit the starter data in `src/db/seed-data.ts`.
- **Images:** starter photos are Unsplash URLs; replace them with your own from the admin panel. If a photo fails to load, the site shows a branded gradient instead of a broken image.
- **Payments:** bookings are confirmed with a 25% advance via a payment link your team sends. To take payments online, plug Razorpay/Stripe into `createBooking` in `src/lib/actions.ts`.

> ⚠️ **Sample content:** the seeded reviews, trust numbers (e.g. "12,000+ travellers") and sample bookings/enquiries are placeholders for development. Replace them with your real figures and genuine customer reviews before launch (`npm run db:reset -- --no-demo`).

---

## 🗂 Project structure

```
src/
  app/(site)/        public pages (home, packages, destinations, booking, reviews…)
  app/admin/         admin console (login + protected panel)
  app/api/           search, packages and assistant endpoints
  components/        UI, 3D globe (three/), home sections, booking, admin…
  db/                Drizzle schema, queries, seed data, bootstrap
  lib/               site config, pricing, server actions, auth, validators
drizzle/             SQL migrations
scripts/setup-db.ts  migrate + seed CLI
```
