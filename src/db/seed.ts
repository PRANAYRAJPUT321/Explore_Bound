import { count, eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";
import { calculatePrice } from "../lib/pricing";
import * as schema from "./schema";
import { seedDestinations, seedPackages, seedReviews } from "./seed-data";

type DB = LibSQLDatabase<typeof schema>;

/** Applies pending SQL migrations from ./drizzle. Safe to run on every start. */
export async function migrateDatabase(db: DB) {
  await db.run("PRAGMA foreign_keys = ON");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
}

/** Fills an empty database with the starter catalogue. Returns false if data already exists. */
export async function seedDatabase(db: DB, { withDemo = true }: { withDemo?: boolean } = {}) {
  const [{ n }] = await db.select({ n: count() }).from(schema.packages);
  if (n > 0) return false;

  console.log("🌱 Seeding Explore Bound starter content…");
  const now = Date.now();
  const day = 86_400_000;

  const destIds = new Map<string, number>();
  for (const d of seedDestinations) {
    const [row] = await db.insert(schema.destinations).values(d).returning({ id: schema.destinations.id });
    destIds.set(d.slug, row.id);
  }

  const pkgIds = new Map<string, number>();
  for (const p of seedPackages) {
    const dest = seedDestinations.find((d) => d.slug === p.destination)!;
    const [row] = await db
      .insert(schema.packages)
      .values({
        slug: p.slug,
        title: p.title,
        destinationId: destIds.get(p.destination)!,
        category: dest.region,
        themes: p.themes,
        route: p.route,
        durationDays: p.durationDays,
        durationNights: p.durationDays - 1,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        offerEndsAt: p.offerDays ? new Date(now + p.offerDays * day + 5 * 3_600_000) : null,
        coverImage: p.coverImage,
        gallery: p.gallery,
        summary: p.summary,
        overview: p.overview,
        highlights: p.highlights,
        itinerary: p.itinerary,
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        groupSizeMax: p.groupSizeMax,
        difficulty: p.difficulty,
        isGroupTour: Boolean(p.groupSeason),
        featured: Boolean(p.featured),
        popularity: p.popularity,
      })
      .returning({ id: schema.packages.id });
    pkgIds.set(p.slug, row.id);

    if (p.groupSeason) {
      // Next five departures that fall inside the package's season (1st & 3rd Saturday-ish).
      const dates: string[] = [];
      const cursor = new Date(now + 14 * day);
      cursor.setDate(1);
      for (let i = 0; i < 24 && dates.length < 5; i++) {
        const m = cursor.getMonth() + 1;
        if (p.groupSeason.includes(m)) {
          for (const dom of [6, 20]) {
            const d = new Date(cursor.getFullYear(), cursor.getMonth(), dom);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dom).padStart(2, "0")}`;
            if (d.getTime() > now + 10 * day && dates.length < 5) dates.push(iso);
          }
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
      const seats = p.seatsPerDeparture ?? 20;
      const fill = [0.82, 0.55, 0.35, 0.2, 0.1];
      await db.insert(schema.departures).values(
        dates.map((startDate, i) => ({
          packageId: row.id,
          startDate,
          totalSeats: seats,
          bookedSeats: withDemo ? Math.round(seats * fill[i]) : 0,
        })),
      );
    }
  }

  if (withDemo) {
    for (const r of seedReviews) {
      await db.insert(schema.reviews).values({
        packageId: pkgIds.get(r.pkg) ?? null,
        name: r.name,
        location: r.location,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        tripType: r.tripType,
        travelMonth: new Date(now - (r.daysAgo + 10) * day).toLocaleString("en-IN", { month: "long", year: "numeric" }),
        status: "approved",
        featured: Boolean(r.featured),
        helpful: (r.comment.length * 7) % 23,
        createdAt: new Date(now - r.daysAgo * day),
      });
    }

    // A few sample bookings & enquiries so the admin dashboard isn't empty.
    const samples = [
      { pkg: "dazzling-dubai", name: "Sample Customer", tier: "deluxe" as const, adults: 2, children: 1, status: "confirmed" as const, pay: "advance-paid" as const, inDays: 35, ago: 3 },
      { pkg: "kerala-gods-own-country", name: "Demo Traveller", tier: "standard" as const, adults: 2, children: 0, status: "pending" as const, pay: "unpaid" as const, inDays: 50, ago: 1 },
      { pkg: "bali-honeymoon-bliss", name: "Test Couple", tier: "luxury" as const, adults: 2, children: 0, status: "confirmed" as const, pay: "paid" as const, inDays: 20, ago: 9 },
      { pkg: "kashmir-paradise-on-earth", name: "Example Family", tier: "deluxe" as const, adults: 4, children: 2, status: "completed" as const, pay: "paid" as const, inDays: -20, ago: 60 },
    ];
    let i = 0;
    for (const s of samples) {
      const p = seedPackages.find((x) => x.slug === s.pkg)!;
      const price = calculatePrice({ basePrice: p.price, tier: s.tier, adults: s.adults, children: s.children, infants: 0, addOnIds: ["insurance"] });
      await db.insert(schema.bookings).values({
        reference: `EB-DEMO-${String(++i).padStart(3, "0")}`,
        packageId: pkgIds.get(s.pkg)!,
        travelDate: new Date(now + s.inDays * day).toISOString().slice(0, 10),
        tier: s.tier,
        adults: s.adults,
        children: s.children,
        infants: 0,
        addOns: price.addOns,
        subtotal: price.subtotal,
        taxes: price.taxes,
        totalAmount: price.total,
        advanceAmount: price.advance,
        customerName: s.name,
        email: `demo${i}@example.com`,
        phone: "+91 90000 0000" + i,
        city: "Demo city",
        status: s.status,
        paymentStatus: s.pay,
        adminNote: "Sample booking created by the seed script — safe to delete.",
        createdAt: new Date(now - s.ago * day),
      });
    }

    await db.insert(schema.enquiries).values([
      { type: "custom-trip", name: "Sample Lead", email: "lead@example.com", phone: "+91 90000 11111", destination: "Switzerland", travelMonth: "May", duration: "8-10 days", travellers: "2 adults", budget: "₹2–3 L per person", interests: ["luxury", "nature"], message: "Sample enquiry from the seed script." },
      { type: "callback", name: "Sample Caller", phone: "+91 90000 22222", preferredTime: "Evening (5–8 PM)", message: "Wants a call about Ladakh group tour." },
    ]);
  }

  // Denormalised rating per package
  for (const [, id] of pkgIds) {
    const rows = await db
      .select({ rating: schema.reviews.rating })
      .from(schema.reviews)
      .where(eq(schema.reviews.packageId, id));
    const approved = rows.length;
    const avg = approved ? rows.reduce((s, r) => s + r.rating, 0) / approved : 0;
    await db
      .update(schema.packages)
      .set({ rating: Math.round(avg * 10) / 10, reviewCount: approved })
      .where(eq(schema.packages.id, id));
  }

  console.info(`✓ Seeded ${seedDestinations.length} destinations, ${seedPackages.length} packages${withDemo ? `, ${seedReviews.length} sample reviews` : ""}.`);
  return true;
}
