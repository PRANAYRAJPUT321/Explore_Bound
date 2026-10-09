import "server-only";
import { and, asc, count, desc, eq, gte, inArray, like, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { todayISO } from "@/lib/utils";
import { db } from "./index";
import { bookings, departures, destinations, enquiries, feedback, packages, reviews, subscribers } from "./schema";

const cardFields = {
  id: packages.id,
  slug: packages.slug,
  title: packages.title,
  category: packages.category,
  themes: packages.themes,
  route: packages.route,
  durationDays: packages.durationDays,
  durationNights: packages.durationNights,
  price: packages.price,
  originalPrice: packages.originalPrice,
  offerEndsAt: packages.offerEndsAt,
  coverImage: packages.coverImage,
  summary: packages.summary,
  rating: packages.rating,
  reviewCount: packages.reviewCount,
  isGroupTour: packages.isGroupTour,
  featured: packages.featured,
  difficulty: packages.difficulty,
  destinationName: destinations.name,
  destinationSlug: destinations.slug,
  country: destinations.country,
};

export type PackageCard = {
  id: number;
  slug: string;
  title: string;
  category: "domestic" | "international";
  themes: string[];
  route: string[];
  durationDays: number;
  durationNights: number;
  price: number;
  originalPrice: number | null;
  offerEndsAt: Date | null;
  coverImage: string;
  summary: string;
  rating: number;
  reviewCount: number;
  isGroupTour: boolean;
  featured: boolean;
  difficulty: "easy" | "moderate" | "challenging";
  destinationName: string;
  destinationSlug: string;
  country: string;
};

const activeOnly = eq(packages.status, "active");

function cards() {
  return db.select(cardFields).from(packages).innerJoin(destinations, eq(packages.destinationId, destinations.id));
}

export async function getFeaturedPackages(limit = 8): Promise<PackageCard[]> {
  return cards().where(and(activeOnly, eq(packages.featured, true))).orderBy(desc(packages.popularity)).limit(limit);
}

export async function getPackagesByCategory(category: "domestic" | "international", limit = 6): Promise<PackageCard[]> {
  return cards().where(and(activeOnly, eq(packages.category, category))).orderBy(desc(packages.popularity)).limit(limit);
}

export async function getDeals(limit = 4): Promise<PackageCard[]> {
  return cards()
    .where(and(activeOnly, sql`${packages.offerEndsAt} > unixepoch()`, sql`${packages.originalPrice} > ${packages.price}`))
    .orderBy(asc(packages.offerEndsAt))
    .limit(limit);
}

export type PackageFilters = {
  q?: string;
  type?: string;
  theme?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  group?: boolean;
  sort?: string;
};

export async function listPackages(f: PackageFilters): Promise<PackageCard[]> {
  const where: SQL[] = [activeOnly];
  if (f.q) {
    const q = `%${f.q.trim()}%`;
    where.push(
      or(
        like(packages.title, q),
        like(packages.summary, q),
        like(destinations.name, q),
        like(destinations.country, q),
        like(packages.route, q),
      )!,
    );
  }
  if (f.type === "domestic" || f.type === "international") where.push(eq(packages.category, f.type));
  if (f.theme) where.push(like(packages.themes, `%"${f.theme.replace(/[%_"]/g, "")}"%`));
  if (f.destination) where.push(eq(destinations.slug, f.destination));
  if (f.minPrice) where.push(gte(packages.price, f.minPrice));
  if (f.maxPrice) where.push(lte(packages.price, f.maxPrice));
  if (f.group) where.push(eq(packages.isGroupTour, true));
  if (f.duration) {
    const [lo, hi] = f.duration.split("-").map(Number);
    if (!Number.isNaN(lo)) where.push(gte(packages.durationDays, lo));
    if (!Number.isNaN(hi)) where.push(lte(packages.durationDays, hi));
  }
  const order =
    f.sort === "price-asc"
      ? [asc(packages.price)]
      : f.sort === "price-desc"
        ? [desc(packages.price)]
        : f.sort === "duration"
          ? [asc(packages.durationDays)]
          : f.sort === "rating"
            ? [desc(packages.rating), desc(packages.reviewCount)]
            : [desc(packages.featured), desc(packages.popularity)];
  return cards().where(and(...where)).orderBy(...order);
}

export async function getPriceBounds() {
  const [row] = await db
    .select({ min: sql<number>`min(${packages.price})`, max: sql<number>`max(${packages.price})` })
    .from(packages)
    .where(activeOnly);
  return { min: row?.min ?? 0, max: row?.max ?? 0 };
}

export async function getPackagesByIds(ids: number[]): Promise<PackageCard[]> {
  if (!ids.length) return [];
  return cards().where(and(activeOnly, inArray(packages.id, ids)));
}

export async function getPackageBySlug(slug: string) {
  const pkg = await db.query.packages.findFirst({
    where: and(eq(packages.slug, slug), activeOnly),
    with: {
      destination: true,
      departures: {
        where: and(gte(departures.startDate, todayISO()), eq(departures.status, "open")),
        orderBy: asc(departures.startDate),
      },
      reviews: {
        where: eq(reviews.status, "approved"),
        orderBy: desc(reviews.createdAt),
        limit: 12,
      },
    },
  });
  return pkg ?? null;
}

export type PackageDetail = NonNullable<Awaited<ReturnType<typeof getPackageBySlug>>>;

export async function getSimilarPackages(pkg: { id: number; destinationId: number; themes: string[] }, limit = 3) {
  const themeMatch = pkg.themes.map((t) => like(packages.themes, `%"${t}"%`));
  return cards()
    .where(and(activeOnly, ne(packages.id, pkg.id), or(eq(packages.destinationId, pkg.destinationId), ...themeMatch)))
    .orderBy(desc(sql`${packages.destinationId} = ${pkg.destinationId}`), desc(packages.popularity))
    .limit(limit);
}

export async function listDestinations() {
  return db
    .select({
      id: destinations.id,
      slug: destinations.slug,
      name: destinations.name,
      country: destinations.country,
      region: destinations.region,
      tagline: destinations.tagline,
      heroImage: destinations.heroImage,
      lat: destinations.lat,
      lng: destinations.lng,
      featured: destinations.featured,
      bestTime: destinations.bestTime,
      packageCount: sql<number>`count(${packages.id})`,
      fromPrice: sql<number | null>`min(${packages.price})`,
    })
    .from(destinations)
    .leftJoin(packages, and(eq(packages.destinationId, destinations.id), activeOnly))
    .groupBy(destinations.id)
    .orderBy(desc(destinations.featured), asc(destinations.name));
}

export type DestinationSummary = Awaited<ReturnType<typeof listDestinations>>[number];

export async function getDestinationBySlug(slug: string) {
  const dest = await db.query.destinations.findFirst({ where: eq(destinations.slug, slug) });
  if (!dest) return null;
  const pkgs = await cards().where(and(activeOnly, eq(packages.destinationId, dest.id))).orderBy(desc(packages.popularity));
  return { ...dest, packages: pkgs };
}

export async function getUpcomingDepartures(limit?: number) {
  const q = db
    .select({
      id: departures.id,
      startDate: departures.startDate,
      totalSeats: departures.totalSeats,
      bookedSeats: departures.bookedSeats,
      price: departures.price,
      packageId: packages.id,
      slug: packages.slug,
      title: packages.title,
      coverImage: packages.coverImage,
      durationDays: packages.durationDays,
      basePrice: packages.price,
      route: packages.route,
      difficulty: packages.difficulty,
      category: packages.category,
      destinationName: destinations.name,
    })
    .from(departures)
    .innerJoin(packages, eq(departures.packageId, packages.id))
    .innerJoin(destinations, eq(packages.destinationId, destinations.id))
    .where(and(activeOnly, eq(departures.status, "open"), gte(departures.startDate, todayISO())))
    .orderBy(asc(departures.startDate));
  return limit ? q.limit(limit) : q;
}

export type UpcomingDeparture = Awaited<ReturnType<typeof getUpcomingDepartures>>[number];

export async function getTestimonials(limit = 10) {
  return db
    .select({
      id: reviews.id,
      name: reviews.name,
      location: reviews.location,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      tripType: reviews.tripType,
      photoUrl: reviews.photoUrl,
      packageTitle: packages.title,
      packageSlug: packages.slug,
      packageImage: packages.coverImage,
    })
    .from(reviews)
    .leftJoin(packages, eq(reviews.packageId, packages.id))
    .where(and(eq(reviews.status, "approved"), eq(reviews.featured, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export type Testimonial = Awaited<ReturnType<typeof getTestimonials>>[number];

export async function getReviewSummary(packageId?: number) {
  const where = and(eq(reviews.status, "approved"), packageId ? eq(reviews.packageId, packageId) : undefined);
  const rows = await db.select({ rating: reviews.rating, n: count() }).from(reviews).where(where).groupBy(reviews.rating);
  const dist = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: rows.find((x) => x.rating === r)?.n ?? 0 }));
  const total = dist.reduce((s, d) => s + d.count, 0);
  const avg = total ? dist.reduce((s, d) => s + d.rating * d.count, 0) / total : 0;
  return { total, average: Math.round(avg * 10) / 10, distribution: dist };
}

export async function listReviews(opts: { rating?: number; packageSlug?: string; sort?: string; page?: number; pageSize?: number }) {
  const pageSize = opts.pageSize ?? 9;
  const page = Math.max(1, opts.page ?? 1);
  const where = and(
    eq(reviews.status, "approved"),
    opts.rating ? eq(reviews.rating, opts.rating) : undefined,
    opts.packageSlug ? eq(packages.slug, opts.packageSlug) : undefined,
  );
  const order =
    opts.sort === "helpful"
      ? [desc(reviews.helpful), desc(reviews.createdAt)]
      : opts.sort === "highest"
        ? [desc(reviews.rating), desc(reviews.createdAt)]
        : opts.sort === "lowest"
          ? [asc(reviews.rating), desc(reviews.createdAt)]
          : [desc(reviews.createdAt)];
  const base = db
    .select({
      id: reviews.id,
      name: reviews.name,
      location: reviews.location,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      tripType: reviews.tripType,
      travelMonth: reviews.travelMonth,
      photoUrl: reviews.photoUrl,
      helpful: reviews.helpful,
      reply: reviews.reply,
      createdAt: reviews.createdAt,
      packageTitle: packages.title,
      packageSlug: packages.slug,
    })
    .from(reviews)
    .leftJoin(packages, eq(reviews.packageId, packages.id))
    .where(where);
  const [items, [{ n }]] = await Promise.all([
    base.orderBy(...order).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ n: count() }).from(reviews).leftJoin(packages, eq(reviews.packageId, packages.id)).where(where),
  ]);
  return { items, total: n, page, pages: Math.max(1, Math.ceil(n / pageSize)) };
}

export type ReviewItem = Awaited<ReturnType<typeof listReviews>>["items"][number];

export async function getPackageOptions() {
  return db
    .select({ id: packages.id, slug: packages.slug, title: packages.title })
    .from(packages)
    .where(activeOnly)
    .orderBy(asc(packages.title));
}

export async function searchSuggestions(q: string) {
  const term = `%${q.trim()}%`;
  const [pkgs, dests] = await Promise.all([
    db
      .select({ slug: packages.slug, title: packages.title, price: packages.price, days: packages.durationDays, image: packages.coverImage })
      .from(packages)
      .innerJoin(destinations, eq(packages.destinationId, destinations.id))
      .where(and(activeOnly, or(like(packages.title, term), like(destinations.name, term), like(packages.route, term), like(destinations.country, term))))
      .orderBy(desc(packages.popularity))
      .limit(5),
    db
      .select({ slug: destinations.slug, name: destinations.name, country: destinations.country, image: destinations.heroImage })
      .from(destinations)
      .where(or(like(destinations.name, term), like(destinations.country, term), like(destinations.tagline, term)))
      .limit(4),
  ]);
  return { packages: pkgs, destinations: dests };
}

export async function getBookingByReference(reference: string, email: string) {
  const row = await db.query.bookings.findFirst({
    where: and(eq(bookings.reference, reference.trim().toUpperCase()), sql`lower(${bookings.email}) = ${email.trim().toLowerCase()}`),
    with: { package: { with: { destination: true } } },
  });
  return row ?? null;
}

export async function recomputePackageRating(packageId: number | null) {
  if (!packageId) return;
  const [row] = await db
    .select({ avg: sql<number | null>`avg(${reviews.rating})`, n: count() })
    .from(reviews)
    .where(and(eq(reviews.packageId, packageId), eq(reviews.status, "approved")));
  await db
    .update(packages)
    .set({ rating: Math.round((row?.avg ?? 0) * 10) / 10, reviewCount: row?.n ?? 0 })
    .where(eq(packages.id, packageId));
}

export async function getSiteRating() {
  const [row] = await db
    .select({ avg: sql<number | null>`avg(${reviews.rating})`, n: count() })
    .from(reviews)
    .where(eq(reviews.status, "approved"));
  return { average: Math.round((row?.avg ?? 0) * 10) / 10, total: row?.n ?? 0 };
}

/* ───────────────────────── Admin ───────────────────────── */

export async function getDashboardStats() {
  const [[b], [pendingReviews], [newEnquiries], [subs], [newFeedback], [pkgs], monthly] = await Promise.all([
    db
      .select({
        total: count(),
        revenue: sql<number>`coalesce(sum(case when ${bookings.status} in ('confirmed','completed') then ${bookings.totalAmount} else 0 end), 0)`,
        pending: sql<number>`sum(case when ${bookings.status} = 'pending' then 1 else 0 end)`,
      })
      .from(bookings),
    db.select({ n: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ n: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db.select({ n: count() }).from(subscribers),
    db.select({ n: count() }).from(feedback).where(eq(feedback.status, "new")),
    db.select({ n: count() }).from(packages).where(activeOnly),
    db
      .select({
        month: sql<string>`strftime('%Y-%m', ${bookings.createdAt}, 'unixepoch')`,
        n: count(),
        value: sql<number>`sum(${bookings.totalAmount})`,
      })
      .from(bookings)
      .where(sql`${bookings.createdAt} >= unixepoch('now', '-6 months')`)
      .groupBy(sql`1`)
      .orderBy(sql`1`),
  ]);
  return {
    bookings: b.total,
    revenue: b.revenue ?? 0,
    pendingBookings: b.pending ?? 0,
    pendingReviews: pendingReviews.n,
    newEnquiries: newEnquiries.n,
    subscribers: subs.n,
    newFeedback: newFeedback.n,
    activePackages: pkgs.n,
    monthly,
  };
}

export async function adminListBookings(status?: string) {
  return db.query.bookings.findMany({
    where: status && status !== "all" ? eq(bookings.status, status as "pending") : undefined,
    with: { package: { columns: { title: true, slug: true, durationDays: true } } },
    orderBy: desc(bookings.createdAt),
  });
}

export async function adminListEnquiries(status?: string) {
  return db.query.enquiries.findMany({
    where: status && status !== "all" ? eq(enquiries.status, status as "new") : undefined,
    with: { package: { columns: { title: true, slug: true } } },
    orderBy: desc(enquiries.createdAt),
  });
}

export async function adminListReviews(status = "pending") {
  return db.query.reviews.findMany({
    where: status === "all" ? undefined : eq(reviews.status, status as "pending"),
    with: { package: { columns: { title: true, slug: true } } },
    orderBy: desc(reviews.createdAt),
  });
}

export async function adminListFeedback() {
  return db.select().from(feedback).orderBy(desc(feedback.createdAt));
}

export async function adminListSubscribers() {
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
}

export async function adminListPackages() {
  return db
    .select({
      id: packages.id,
      slug: packages.slug,
      title: packages.title,
      status: packages.status,
      featured: packages.featured,
      isGroupTour: packages.isGroupTour,
      price: packages.price,
      durationDays: packages.durationDays,
      coverImage: packages.coverImage,
      rating: packages.rating,
      reviewCount: packages.reviewCount,
      destinationName: destinations.name,
      bookings: sql<number>`(select count(*) from ${bookings} where ${bookings.packageId} = ${packages.id})`,
    })
    .from(packages)
    .innerJoin(destinations, eq(packages.destinationId, destinations.id))
    .orderBy(desc(packages.createdAt), desc(packages.id));
}

export async function adminGetPackage(id: number) {
  const pkg = await db.query.packages.findFirst({
    where: eq(packages.id, id),
    with: { departures: { orderBy: asc(departures.startDate) } },
  });
  return pkg ?? null;
}

export async function adminListDestinations() {
  return db.select().from(destinations).orderBy(asc(destinations.name));
}

export async function adminGetDestination(id: number) {
  return (await db.query.destinations.findFirst({ where: eq(destinations.id, id) })) ?? null;
}

export async function getPackagesForCompare(ids: number[]) {
  if (!ids.length) return [];
  const rows = await db.query.packages.findMany({
    where: and(activeOnly, inArray(packages.id, ids)),
    with: {
      destination: { columns: { name: true, country: true, bestTime: true, visaInfo: true } },
      departures: { where: and(gte(departures.startDate, todayISO()), eq(departures.status, "open")), columns: { startDate: true } },
    },
  });
  return rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}
