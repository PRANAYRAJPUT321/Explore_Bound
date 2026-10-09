import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  meals?: string;
  stay?: string;
  activities?: string[];
};

export const destinations = sqliteTable(
  "destinations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    country: text("country").notNull(),
    region: text("region", { enum: ["domestic", "international"] }).notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    heroImage: text("hero_image").notNull(),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    bestTime: text("best_time").notNull(),
    climate: text("climate").notNull().default(""),
    visaInfo: text("visa_info").notNull().default(""),
    highlights: text("highlights", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("destinations_slug_idx").on(t.slug)],
);

export const packages = sqliteTable(
  "packages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    destinationId: integer("destination_id")
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    category: text("category", { enum: ["domestic", "international"] }).notNull(),
    themes: text("themes", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    route: text("route", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    durationDays: integer("duration_days").notNull(),
    durationNights: integer("duration_nights").notNull(),
    price: integer("price").notNull(),
    originalPrice: integer("original_price"),
    offerEndsAt: integer("offer_ends_at", { mode: "timestamp" }),
    coverImage: text("cover_image").notNull(),
    gallery: text("gallery", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    summary: text("summary").notNull(),
    overview: text("overview").notNull(),
    highlights: text("highlights", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    itinerary: text("itinerary", { mode: "json" }).$type<ItineraryDay[]>().notNull().default(sql`'[]'`),
    inclusions: text("inclusions", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    exclusions: text("exclusions", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    groupSizeMax: integer("group_size_max").notNull().default(12),
    difficulty: text("difficulty", { enum: ["easy", "moderate", "challenging"] }).notNull().default("easy"),
    isGroupTour: integer("is_group_tour", { mode: "boolean" }).notNull().default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["active", "draft"] }).notNull().default("active"),
    rating: real("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    popularity: integer("popularity").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("packages_slug_idx").on(t.slug), index("packages_destination_idx").on(t.destinationId)],
);

export const departures = sqliteTable(
  "departures",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    packageId: integer("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(),
    totalSeats: integer("total_seats").notNull(),
    bookedSeats: integer("booked_seats").notNull().default(0),
    price: integer("price"),
    status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  },
  (t) => [index("departures_package_idx").on(t.packageId)],
);

export type BookingAddOn = { id: string; name: string; amount: number };
export type Traveller = { name: string; age: number; type: "adult" | "child" | "infant" };

export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reference: text("reference").notNull(),
    packageId: integer("package_id")
      .notNull()
      .references(() => packages.id),
    departureId: integer("departure_id").references(() => departures.id),
    travelDate: text("travel_date").notNull(),
    tier: text("tier", { enum: ["standard", "deluxe", "luxury"] }).notNull().default("standard"),
    adults: integer("adults").notNull(),
    children: integer("children").notNull().default(0),
    infants: integer("infants").notNull().default(0),
    addOns: text("add_ons", { mode: "json" }).$type<BookingAddOn[]>().notNull().default(sql`'[]'`),
    travellers: text("travellers", { mode: "json" }).$type<Traveller[]>().notNull().default(sql`'[]'`),
    subtotal: integer("subtotal").notNull(),
    taxes: integer("taxes").notNull(),
    totalAmount: integer("total_amount").notNull(),
    advanceAmount: integer("advance_amount").notNull(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city").notNull().default(""),
    specialRequests: text("special_requests").notNull().default(""),
    status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] })
      .notNull()
      .default("pending"),
    paymentStatus: text("payment_status", { enum: ["unpaid", "advance-paid", "paid", "refunded"] })
      .notNull()
      .default("unpaid"),
    adminNote: text("admin_note").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("bookings_reference_idx").on(t.reference)],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    packageId: integer("package_id").references(() => packages.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull().default(""),
    location: text("location").notNull().default(""),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    comment: text("comment").notNull(),
    tripType: text("trip_type").notNull().default(""),
    travelMonth: text("travel_month").notNull().default(""),
    photoUrl: text("photo_url").notNull().default(""),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    helpful: integer("helpful").notNull().default(0),
    reply: text("reply").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_package_idx").on(t.packageId), index("reviews_status_idx").on(t.status)],
);

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category", { enum: ["website", "booking", "trip", "suggestion", "complaint"] }).notNull(),
  score: integer("score").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "read", "resolved"] }).notNull().default("new"),
  createdAt: createdAt(),
});

export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["custom-trip", "package", "contact", "callback"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  packageId: integer("package_id").references(() => packages.id, { onDelete: "set null" }),
  destination: text("destination").notNull().default(""),
  travelMonth: text("travel_month").notNull().default(""),
  duration: text("duration").notNull().default(""),
  travellers: text("travellers").notNull().default(""),
  budget: text("budget").notNull().default(""),
  interests: text("interests", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  preferredTime: text("preferred_time").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status", { enum: ["new", "contacted", "converted", "closed"] }).notNull().default("new"),
  createdAt: createdAt(),
});

export const subscribers = sqliteTable(
  "subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("subscribers_email_idx").on(t.email)],
);

export const destinationsRelations = relations(destinations, ({ many }) => ({
  packages: many(packages),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  destination: one(destinations, { fields: [packages.destinationId], references: [destinations.id] }),
  departures: many(departures),
  reviews: many(reviews),
  bookings: many(bookings),
}));

export const departuresRelations = relations(departures, ({ one }) => ({
  package: one(packages, { fields: [departures.packageId], references: [packages.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  package: one(packages, { fields: [bookings.packageId], references: [packages.id] }),
  departure: one(departures, { fields: [bookings.departureId], references: [departures.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  package: one(packages, { fields: [reviews.packageId], references: [packages.id] }),
}));

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  package: one(packages, { fields: [enquiries.packageId], references: [packages.id] }),
}));

export type Destination = typeof destinations.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Departure = typeof departures.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
