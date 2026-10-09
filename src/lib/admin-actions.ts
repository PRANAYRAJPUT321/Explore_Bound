"use server";

import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { recomputePackageRating } from "@/db/queries";
import { bookings, departures, destinations, enquiries, feedback, packages, reviews, subscribers, type ItineraryDay } from "@/db/schema";
import { checkCredentials, createSession, destroySession, requireAdmin } from "./auth";
import { slugify } from "./utils";
import { fieldErrors } from "./validators";

export type AdminState = { ok: boolean; message: string; errors?: Record<string, string[]> };

const refreshSite = () => revalidatePath("/", "layout");
const num = (fd: FormData, k: string) => Number(fd.get(k));
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const lines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/* ── auth ── */

const loginAttempts = new Map<string, number[]>();

export async function login(_: AdminState, fd: FormData): Promise<AdminState> {
  const email = str(fd, "email");
  const now = Date.now();
  const recent = (loginAttempts.get(email) ?? []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 8) return { ok: false, message: "Too many attempts. Try again in 15 minutes." };
  if (!checkCredentials(email, String(fd.get("password") ?? ""))) {
    loginAttempts.set(email, [...recent, now]);
    return { ok: false, message: "Invalid email or password." };
  }
  loginAttempts.delete(email);
  await createSession(email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ── bookings ── */

export async function updateBooking(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const status = str(fd, "status") as "pending" | "confirmed" | "completed" | "cancelled";
  const paymentStatus = str(fd, "paymentStatus") as "unpaid" | "advance-paid" | "paid" | "refunded";
  if (!["pending", "confirmed", "completed", "cancelled"].includes(status) || !["unpaid", "advance-paid", "paid", "refunded"].includes(paymentStatus)) return;
  const current = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
  if (!current) return;
  const seats = current.adults + current.children;
  if (current.departureId && current.status !== status) {
    if (status === "cancelled") {
      await db.update(departures).set({ bookedSeats: sql`max(0, ${departures.bookedSeats} - ${seats})` }).where(eq(departures.id, current.departureId));
    } else if (current.status === "cancelled") {
      await db.update(departures).set({ bookedSeats: sql`${departures.bookedSeats} + ${seats}` }).where(eq(departures.id, current.departureId));
    }
  }
  await db.update(bookings).set({ status, paymentStatus, adminNote: str(fd, "adminNote").slice(0, 2000) }).where(eq(bookings.id, id));
  revalidatePath("/admin", "layout");
  revalidatePath("/group-tours");
}

export async function deleteBooking(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const current = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
  if (!current) return;
  if (current.departureId && current.status !== "cancelled") {
    await db
      .update(departures)
      .set({ bookedSeats: sql`max(0, ${departures.bookedSeats} - ${current.adults + current.children})` })
      .where(eq(departures.id, current.departureId));
  }
  await db.delete(bookings).where(eq(bookings.id, id));
  revalidatePath("/admin", "layout");
}

/* ── enquiries ── */

export async function updateEnquiry(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status") as "new" | "contacted" | "converted" | "closed";
  if (!["new", "contacted", "converted", "closed"].includes(status)) return;
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, num(fd, "id")));
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(fd: FormData) {
  await requireAdmin();
  await db.delete(enquiries).where(eq(enquiries.id, num(fd, "id")));
  revalidatePath("/admin", "layout");
}

/* ── reviews ── */

export async function moderateReview(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const op = str(fd, "op");
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, id) });
  if (!review) return;
  if (op === "delete") await db.delete(reviews).where(eq(reviews.id, id));
  else if (op === "approve") await db.update(reviews).set({ status: "approved" }).where(eq(reviews.id, id));
  else if (op === "reject") await db.update(reviews).set({ status: "rejected", featured: false }).where(eq(reviews.id, id));
  else if (op === "feature") await db.update(reviews).set({ featured: !review.featured, status: "approved" }).where(eq(reviews.id, id));
  else if (op === "reply") await db.update(reviews).set({ reply: str(fd, "reply").slice(0, 1500) }).where(eq(reviews.id, id));
  await recomputePackageRating(review.packageId);
  revalidatePath("/admin", "layout");
  refreshSite();
}

/* ── feedback & subscribers ── */

export async function updateFeedback(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status") as "new" | "read" | "resolved";
  if (!["new", "read", "resolved"].includes(status)) return;
  await db.update(feedback).set({ status }).where(eq(feedback.id, num(fd, "id")));
  revalidatePath("/admin", "layout");
}

export async function deleteFeedback(fd: FormData) {
  await requireAdmin();
  await db.delete(feedback).where(eq(feedback.id, num(fd, "id")));
  revalidatePath("/admin", "layout");
}

export async function deleteSubscriber(fd: FormData) {
  await requireAdmin();
  await db.delete(subscribers).where(eq(subscribers.id, num(fd, "id")));
  revalidatePath("/admin", "layout");
}

/* ── packages ── */

const itineraryDay = z.object({
  day: z.number().int().min(1),
  title: z.string().trim().min(1, "Every day needs a title").max(160),
  description: z.string().trim().max(2000),
  meals: z.string().trim().max(120).optional(),
  stay: z.string().trim().max(160).optional(),
  activities: z.array(z.string().trim().max(80)).max(12).optional(),
});

const packageSchema = z.object({
  title: z.string().trim().min(4, "Title is too short").max(140),
  slug: z.string().trim().max(140),
  destinationId: z.coerce.number().int().positive("Pick a destination"),
  durationDays: z.coerce.number().int().min(1).max(60),
  price: z.coerce.number().int().min(1, "Enter a price"),
  originalPrice: z.coerce.number().int().min(0).optional(),
  offerEndsAt: z.string().optional(),
  coverImage: z.url("Cover image must be a full URL"),
  summary: z.string().trim().min(10, "Add a one-line summary").max(300),
  overview: z.string().trim().min(20, "Overview is too short").max(5000),
  groupSizeMax: z.coerce.number().int().min(1).max(200),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  status: z.enum(["active", "draft"]),
  popularity: z.coerce.number().int().min(0).max(100000),
});

export async function savePackage(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = num(fd, "id") || null;
  const parsed = packageSchema.safeParse({
    title: fd.get("title"),
    slug: fd.get("slug"),
    destinationId: fd.get("destinationId"),
    durationDays: fd.get("durationDays"),
    price: fd.get("price"),
    originalPrice: fd.get("originalPrice") || undefined,
    offerEndsAt: fd.get("offerEndsAt") || undefined,
    coverImage: fd.get("coverImage"),
    summary: fd.get("summary"),
    overview: fd.get("overview"),
    groupSizeMax: fd.get("groupSizeMax"),
    difficulty: fd.get("difficulty"),
    status: fd.get("status"),
    popularity: fd.get("popularity") || 0,
  });
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  let itinerary: ItineraryDay[] = [];
  try {
    const raw = z.array(itineraryDay).max(60).safeParse(JSON.parse(String(fd.get("itinerary") ?? "[]")));
    if (!raw.success) return { ok: false, message: raw.error.issues[0]?.message ?? "Check the itinerary", errors: { itinerary: ["Check the itinerary"] } };
    itinerary = raw.data.map((d, i) => ({ ...d, day: i + 1 }));
  } catch {
    return { ok: false, message: "Itinerary data is invalid." };
  }

  const dest = await db.query.destinations.findFirst({ where: eq(destinations.id, v.destinationId) });
  if (!dest) return { ok: false, message: "Destination not found.", errors: { destinationId: ["Pick a destination"] } };

  const slug = slugify(v.slug || v.title);
  if (!slug) return { ok: false, message: "Slug is invalid.", errors: { slug: ["Use letters and numbers"] } };
  const clash = await db.query.packages.findFirst({ where: eq(packages.slug, slug) });
  if (clash && clash.id !== id) return { ok: false, message: "Another package already uses this URL slug.", errors: { slug: ["Already in use"] } };

  const offer = v.offerEndsAt ? new Date(v.offerEndsAt) : null;
  const values = {
    title: v.title,
    slug,
    destinationId: dest.id,
    category: dest.region,
    themes: fd.getAll("themes").map(String).slice(0, 13),
    route: str(fd, "route")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    durationDays: v.durationDays,
    durationNights: Math.max(0, v.durationDays - 1),
    price: v.price,
    originalPrice: v.originalPrice && v.originalPrice > v.price ? v.originalPrice : null,
    offerEndsAt: offer && !Number.isNaN(offer.getTime()) ? offer : null,
    coverImage: v.coverImage,
    gallery: lines(str(fd, "gallery")).filter((u) => /^https?:\/\//.test(u)),
    summary: v.summary,
    overview: v.overview,
    highlights: lines(str(fd, "highlights")),
    itinerary,
    inclusions: lines(str(fd, "inclusions")),
    exclusions: lines(str(fd, "exclusions")),
    groupSizeMax: v.groupSizeMax,
    difficulty: v.difficulty,
    isGroupTour: fd.get("isGroupTour") === "on",
    featured: fd.get("featured") === "on",
    status: v.status,
    popularity: v.popularity,
  };

  let savedId = id;
  if (id) await db.update(packages).set(values).where(eq(packages.id, id));
  else {
    const [row] = await db.insert(packages).values(values).returning({ id: packages.id });
    savedId = row.id;
  }
  refreshSite();
  if (!id) redirect(`/admin/packages/${savedId}?created=1`);
  return { ok: true, message: "Package saved — changes are live on the website." };
}

export async function deletePackage(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const [{ n }] = await db.select({ n: count() }).from(bookings).where(eq(bookings.packageId, id));
  if (n > 0) await db.update(packages).set({ status: "draft" }).where(eq(packages.id, id));
  else await db.delete(packages).where(eq(packages.id, id));
  refreshSite();
  redirect("/admin/packages");
}

export async function togglePackage(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const field = str(fd, "field");
  const pkg = await db.query.packages.findFirst({ where: eq(packages.id, id) });
  if (!pkg) return;
  if (field === "featured") await db.update(packages).set({ featured: !pkg.featured }).where(eq(packages.id, id));
  if (field === "status") await db.update(packages).set({ status: pkg.status === "active" ? "draft" : "active" }).where(eq(packages.id, id));
  refreshSite();
}

export async function addDeparture(fd: FormData) {
  await requireAdmin();
  const packageId = num(fd, "packageId");
  const startDate = str(fd, "startDate");
  const totalSeats = num(fd, "totalSeats");
  const price = num(fd, "price");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !(totalSeats > 0)) return;
  await db.insert(departures).values({ packageId, startDate, totalSeats: Math.min(500, totalSeats), price: price > 0 ? price : null });
  await db.update(packages).set({ isGroupTour: true }).where(eq(packages.id, packageId));
  refreshSite();
}

export async function updateDeparture(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const op = str(fd, "op");
  const dep = await db.query.departures.findFirst({ where: eq(departures.id, id) });
  if (!dep) return;
  if (op === "toggle") await db.update(departures).set({ status: dep.status === "open" ? "closed" : "open" }).where(eq(departures.id, id));
  if (op === "delete") {
    const [{ n }] = await db.select({ n: count() }).from(bookings).where(and(eq(bookings.departureId, id)));
    if (n === 0) await db.delete(departures).where(eq(departures.id, id));
    else await db.update(departures).set({ status: "closed" }).where(eq(departures.id, id));
  }
  refreshSite();
}

/* ── destinations ── */

const destinationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80),
  country: z.string().trim().min(2).max(80),
  region: z.enum(["domestic", "international"]),
  tagline: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  heroImage: z.url("Hero image must be a full URL"),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  bestTime: z.string().trim().min(2).max(160),
  climate: z.string().trim().max(160),
  visaInfo: z.string().trim().max(400),
});

export async function saveDestination(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = num(fd, "id") || null;
  const parsed = destinationSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const v = parsed.data;
  const slug = slugify(v.slug || v.name);
  const clash = await db.query.destinations.findFirst({ where: eq(destinations.slug, slug) });
  if (clash && clash.id !== id) return { ok: false, message: "Slug already in use.", errors: { slug: ["Already in use"] } };
  const values = { ...v, slug, highlights: lines(str(fd, "highlights")), featured: fd.get("featured") === "on" };
  if (id) {
    await db.update(destinations).set(values).where(eq(destinations.id, id));
    // keep each package's domestic/international flag in sync with its destination
    await db.update(packages).set({ category: v.region }).where(eq(packages.destinationId, id));
  } else await db.insert(destinations).values(values);
  refreshSite();
  if (!id) redirect("/admin/destinations?created=1");
  return { ok: true, message: "Destination saved." };
}

export async function deleteDestination(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const [{ n }] = await db.select({ n: count() }).from(packages).where(eq(packages.destinationId, id));
  if (n > 0) redirect(`/admin/destinations/${id}?error=has-packages`);
  await db.delete(destinations).where(eq(destinations.id, id));
  refreshSite();
  redirect("/admin/destinations");
}
