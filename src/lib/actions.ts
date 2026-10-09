"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { getBookingByReference } from "@/db/queries";
import { bookings, departures, enquiries, feedback, packages, reviews, subscribers } from "@/db/schema";
import { calculatePrice } from "./pricing";
import { todayISO } from "./utils";
import {
  bookingSchema,
  callbackSchema,
  enquirySchema,
  feedbackSchema,
  fieldErrors,
  reviewSchema,
  subscribeSchema,
  tripPlanSchema,
  type BookingInput,
  type TripPlanInput,
} from "./validators";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

/* ── tiny in-memory rate limiter (per server instance) ── */
const hits = new Map<string, number[]>();
async function limited(bucket: string, max = 8, windowMs = 10 * 60_000) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

const formObject = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));
const isBot = (fd: FormData) => Boolean(fd.get("company"));
const TOO_MANY: ActionState = { ok: false, message: "Too many requests — please try again in a few minutes." };

export async function submitReview(_: ActionState, fd: FormData): Promise<ActionState> {
  if (isBot(fd)) return { ok: true, message: "Thank you!" };
  if (await limited("review", 4)) return TOO_MANY;
  const parsed = reviewSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const v = parsed.data;
  await db.insert(reviews).values({ ...v, packageId: v.packageId ?? null, status: "pending" });
  return {
    ok: true,
    message: "Thank you for sharing your story! Your review will appear once our team verifies it (usually within 24 hours).",
  };
}

export async function markReviewHelpful(id: number) {
  if (!Number.isInteger(id) || id <= 0) return;
  if (await limited("helpful", 30)) return;
  await db.update(reviews).set({ helpful: sql`${reviews.helpful} + 1` }).where(and(eq(reviews.id, id), eq(reviews.status, "approved")));
}

export async function submitFeedback(_: ActionState, fd: FormData): Promise<ActionState> {
  if (isBot(fd)) return { ok: true, message: "Thank you!" };
  if (await limited("feedback", 5)) return TOO_MANY;
  const parsed = feedbackSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  await db.insert(feedback).values(parsed.data);
  return { ok: true, message: "Feedback received — thank you for helping us get better every day!" };
}

export async function submitEnquiry(_: ActionState, fd: FormData): Promise<ActionState> {
  if (isBot(fd)) return { ok: true, message: "Thank you!" };
  if (await limited("enquiry", 6)) return TOO_MANY;
  const parsed = enquirySchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const v = parsed.data;
  await db.insert(enquiries).values({ ...v, packageId: v.packageId ?? null });
  return { ok: true, message: "Got it! A trip expert will reach out within 2 working hours." };
}

export async function requestCallback(_: ActionState, fd: FormData): Promise<ActionState> {
  if (isBot(fd)) return { ok: true, message: "Thank you!" };
  if (await limited("callback", 4)) return TOO_MANY;
  const parsed = callbackSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  await db.insert(enquiries).values({ type: "callback", ...parsed.data });
  return { ok: true, message: `Callback scheduled! We'll call you (${parsed.data.preferredTime}).` };
}

export async function subscribe(_: ActionState, fd: FormData): Promise<ActionState> {
  if (isBot(fd)) return { ok: true, message: "Subscribed!" };
  if (await limited("subscribe", 5)) return TOO_MANY;
  const parsed = subscribeSchema.safeParse(formObject(fd));
  if (!parsed.success) return { ok: false, message: "Enter a valid email address.", errors: fieldErrors(parsed.error) };
  await db.insert(subscribers).values(parsed.data).onConflictDoNothing();
  return { ok: true, message: "You're in! Watch your inbox for secret deals ✈️" };
}

export async function submitTripPlan(input: TripPlanInput): Promise<ActionState> {
  if (await limited("plan", 4)) return TOO_MANY;
  const parsed = tripPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const v = parsed.data;
  await db.insert(enquiries).values({
    type: "custom-trip",
    name: v.name,
    email: v.email,
    phone: v.phone,
    destination: v.destination,
    travelMonth: v.travelMonth,
    duration: v.duration,
    travellers: `${v.adults} adult${v.adults > 1 ? "s" : ""}${v.children ? `, ${v.children} child${v.children > 1 ? "ren" : ""}` : ""}`,
    budget: v.budget,
    interests: v.interests,
    message: [v.stay && `Preferred stay: ${v.stay}`, v.message].filter(Boolean).join("\n"),
  });
  return { ok: true, message: "Your dream trip is on our drawing board! Expect a personalised itinerary within 24 hours." };
}

export type BookingResult =
  | { ok: true; reference: string; total: number; advance: number; email: string; travelDate: string }
  | { ok: false; message: string; errors?: Record<string, string[]> };

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeReference() {
  const d = new Date();
  let rand = "";
  for (let i = 0; i < 4; i++) rand += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return `EB-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${rand}`;
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  if (await limited("booking", 6)) return { ok: false, message: TOO_MANY.message };
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please check your booking details.", errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const pkg = await db.query.packages.findFirst({
    where: and(eq(packages.id, v.packageId), eq(packages.status, "active")),
    with: { departures: { where: and(eq(departures.status, "open"), gte(departures.startDate, todayISO())) } },
  });
  if (!pkg) return { ok: false, message: "This package is no longer available." };

  let basePrice = pkg.price;
  let travelDate = v.travelDate;
  let departureId: number | null = null;
  const seatsNeeded = v.adults + v.children;

  if (pkg.departures.length > 0) {
    const dep = pkg.departures.find((d) => d.id === v.departureId);
    if (!dep) return { ok: false, message: "Please choose one of the scheduled departure dates.", errors: { departureId: ["Choose a departure"] } };
    if (dep.totalSeats - dep.bookedSeats < seatsNeeded) {
      return { ok: false, message: `Only ${Math.max(0, dep.totalSeats - dep.bookedSeats)} seat(s) left on this departure.` };
    }
    basePrice = dep.price ?? pkg.price;
    travelDate = dep.startDate;
    departureId = dep.id;
  } else if (travelDate < todayISO(3)) {
    return { ok: false, message: "Travel date must be at least 3 days from today.", errors: { travelDate: ["Pick a later date"] } };
  }

  const price = calculatePrice({ basePrice, tier: v.tier, adults: v.adults, children: v.children, infants: v.infants, addOnIds: v.addOnIds });

  if (departureId) {
    // Reserve seats atomically so two people can't grab the last seat.
    const res = await db
      .update(departures)
      .set({ bookedSeats: sql`${departures.bookedSeats} + ${seatsNeeded}` })
      .where(and(eq(departures.id, departureId), sql`${departures.bookedSeats} + ${seatsNeeded} <= ${departures.totalSeats}`));
    if (res.rowsAffected === 0) return { ok: false, message: "Sorry — those seats were just taken. Please pick another departure." };
  }

  let reference = makeReference();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.insert(bookings).values({
        reference,
        packageId: pkg.id,
        departureId,
        travelDate,
        tier: v.tier,
        adults: v.adults,
        children: v.children,
        infants: v.infants,
        addOns: price.addOns,
        travellers: v.travellers.filter((t) => t.name),
        subtotal: price.subtotal,
        taxes: price.taxes,
        totalAmount: price.total,
        advanceAmount: price.advance,
        customerName: v.customerName,
        email: v.email,
        phone: v.phone,
        city: v.city,
        specialRequests: v.specialRequests,
      });
      break;
    } catch (err) {
      if (attempt === 4 || !String(err).includes("UNIQUE")) {
        if (departureId) {
          await db
            .update(departures)
            .set({ bookedSeats: sql`max(0, ${departures.bookedSeats} - ${seatsNeeded})` })
            .where(eq(departures.id, departureId));
        }
        throw err;
      }
      reference = makeReference();
    }
  }

  await db.update(packages).set({ popularity: sql`${packages.popularity} + 1` }).where(eq(packages.id, pkg.id));
  revalidatePath(`/packages/${pkg.slug}`);
  revalidatePath("/group-tours");

  return { ok: true, reference, total: price.total, advance: price.advance, email: v.email, travelDate };
}

export type LookupState =
  | { ok: false; message: string }
  | {
      ok: true;
      message: string;
      booking: {
        reference: string;
        status: string;
        paymentStatus: string;
        travelDate: string;
        tier: string;
        adults: number;
        children: number;
        infants: number;
        totalAmount: number;
        advanceAmount: number;
        customerName: string;
        createdAt: string;
        packageTitle: string;
        packageSlug: string;
        coverImage: string;
        destination: string;
        durationDays: number;
        addOns: { name: string; amount: number }[];
      };
    };

export async function lookupBooking(_: LookupState, fd: FormData): Promise<LookupState> {
  if (await limited("lookup", 15)) return { ok: false, message: TOO_MANY.message };
  const ref = String(fd.get("reference") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  if (!ref || !email) return { ok: false, message: "Enter your booking reference and email." };
  const b = await getBookingByReference(ref, email);
  if (!b) return { ok: false, message: "We couldn't find a booking with those details. Double-check the reference (e.g. EB-2610-AB12) and email." };
  return {
    ok: true,
    message: "Booking found",
    booking: {
      reference: b.reference,
      status: b.status,
      paymentStatus: b.paymentStatus,
      travelDate: b.travelDate,
      tier: b.tier,
      adults: b.adults,
      children: b.children,
      infants: b.infants,
      totalAmount: b.totalAmount,
      advanceAmount: b.advanceAmount,
      customerName: b.customerName,
      createdAt: b.createdAt.toISOString(),
      packageTitle: b.package.title,
      packageSlug: b.package.slug,
      coverImage: b.package.coverImage,
      destination: b.package.destination.name,
      durationDays: b.package.durationDays,
      addOns: b.addOns,
    },
  };
}
