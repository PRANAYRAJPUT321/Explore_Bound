import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(8, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[+\d][\d\s-]{6,}$/, "Enter a valid phone number");
const email = z.email("Enter a valid email address").trim().toLowerCase();
const name = z.string().trim().min(2, "Please enter your name").max(80);

export const reviewSchema = z.object({
  name,
  email,
  location: z.string().trim().max(60).default(""),
  packageId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  rating: z.coerce.number().int().min(1, "Please pick a star rating").max(5),
  title: z.string().trim().min(4, "Give your review a short title").max(100),
  comment: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(2000),
  tripType: z.string().trim().max(40).default(""),
  travelMonth: z.string().trim().max(40).default(""),
  photoUrl: z.union([z.url("Enter a valid image link"), z.literal("")]).default(""),
});

export const feedbackSchema = z.object({
  name,
  email,
  category: z.enum(["website", "booking", "trip", "suggestion", "complaint"]),
  score: z.coerce.number().int().min(0).max(10),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

export const enquirySchema = z.object({
  type: z.enum(["package", "contact"]),
  name,
  email,
  phone,
  packageId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  travelMonth: z.string().trim().max(40).default(""),
  travellers: z.string().trim().max(40).default(""),
  message: z.string().trim().max(2000).default(""),
});

export const callbackSchema = z.object({
  name,
  phone,
  preferredTime: z.string().trim().max(60).default("Any time"),
  message: z.string().trim().max(500).default(""),
});

export const subscribeSchema = z.object({ email });

export const tripPlanSchema = z.object({
  destination: z.string().trim().min(2, "Where would you like to go?").max(120),
  travelMonth: z.string().trim().min(2, "Pick a month").max(40),
  duration: z.string().trim().min(1).max(40),
  adults: z.coerce.number().int().min(1).max(50),
  children: z.coerce.number().int().min(0).max(20),
  budget: z.string().trim().min(1).max(60),
  interests: z.array(z.string().max(30)).max(12).default([]),
  stay: z.string().trim().max(40).default(""),
  name,
  email,
  phone,
  message: z.string().trim().max(2000).default(""),
});

export type TripPlanInput = z.input<typeof tripPlanSchema>;

export const bookingSchema = z.object({
  packageId: z.coerce.number().int().positive(),
  departureId: z.coerce.number().int().positive().optional().nullable(),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a travel date"),
  tier: z.enum(["standard", "deluxe", "luxury"]),
  adults: z.coerce.number().int().min(1, "At least one adult").max(30),
  children: z.coerce.number().int().min(0).max(20),
  infants: z.coerce.number().int().min(0).max(10),
  addOnIds: z.array(z.string().max(20)).max(10).default([]),
  customerName: name,
  email,
  phone,
  city: z.string().trim().max(60).default(""),
  specialRequests: z.string().trim().max(1000).default(""),
  travellers: z
    .array(z.object({ name: z.string().trim().max(80), age: z.coerce.number().int().min(0).max(110), type: z.enum(["adult", "child", "infant"]) }))
    .max(60)
    .default([]),
  acceptTerms: z.literal(true, { error: "Please accept the booking terms" }),
});

export type BookingInput = z.input<typeof bookingSchema>;

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
