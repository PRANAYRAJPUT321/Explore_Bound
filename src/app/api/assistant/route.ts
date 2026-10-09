import { NextResponse } from "next/server";
import { getDeals, getDestinationBySlug, getUpcomingDepartures, listDestinations, listPackages, type PackageFilters } from "@/db/queries";
import { faqs, site, themes } from "@/lib/site";
import { formatDate, formatINR } from "@/lib/utils";

type Reply = {
  reply: string;
  packages?: { slug: string; title: string; price: number; days: number; image: string; destination: string }[];
  actions?: { label: string; href: string }[];
  quickReplies?: string[];
};

const QUICK = ["Honeymoon under ₹60k", "Family trip abroad", "Group tours", "Today's deals", "Talk to an expert"];

const themeWords: Record<string, string[]> = {
  honeymoon: ["honeymoon", "romantic", "couple", "anniversary"],
  family: ["family", "kids", "parents", "children"],
  adventure: ["adventure", "trek", "bike", "ride", "scuba", "thrill"],
  beach: ["beach", "island", "sea", "ocean"],
  pilgrimage: ["pilgrimage", "yatra", "temple", "dham", "spiritual"],
  luxury: ["luxury", "5 star", "premium", "villa"],
  culture: ["culture", "heritage", "history", "fort", "palace"],
  friends: ["friends", "bachelor", "party", "gang"],
  nature: ["nature", "mountain", "hills", "snow", "valley"],
  group: ["group", "fixed departure"],
};

function parseBudget(text: string): number | undefined {
  const m = text.match(/(?:under|below|less than|within|budget(?: of)?|upto|up to|max)\s*(?:rs\.?|inr|₹)?\s*([\d,.]+)\s*(k|thousand|l|lakh|lac|lakhs)?/i);
  if (!m) return undefined;
  let n = parseFloat(m[1].replace(/,/g, ""));
  const unit = m[2]?.toLowerCase();
  if (unit === "k" || unit === "thousand") n *= 1000;
  if (unit && unit.startsWith("l")) n *= 100000;
  if (!unit && n < 1000) n *= 1000;
  return Math.round(n);
}

const toCards = (rows: Awaited<ReturnType<typeof listPackages>>) =>
  rows.slice(0, 3).map((p) => ({ slug: p.slug, title: p.title, price: p.price, days: p.durationDays, image: p.coverImage, destination: p.destinationName }));

async function answer(raw: string): Promise<Reply> {
  const text = raw.toLowerCase().trim();
  if (!text) return { reply: "Ask me anything about trips, prices, visas or bookings!", quickReplies: QUICK };

  const ref = raw.match(/EB-[A-Z0-9]{3,6}-[A-Z0-9]{3,5}/i)?.[0];
  if (ref || /\b(my booking|booking status|track)\b/.test(text)) {
    return {
      reply: `You can see live status, payments and trip details on the Manage Booking page${ref ? ` — just enter ${ref.toUpperCase()} and the email you booked with` : ""}.`,
      actions: [{ label: "Manage my booking", href: "/my-booking" }],
    };
  }

  if (/^(hi|hello|hey|namaste|hola|good (morning|evening|afternoon))\b/.test(text)) {
    return { reply: `Namaste! 👋 I'm Bound, your trip assistant at ${site.shortName}. Tell me where you dream of going, your budget or the kind of trip you want.`, quickReplies: QUICK };
  }

  if (/\b(call|phone|talk|human|agent|expert|contact|whatsapp|number)\b/.test(text)) {
    return {
      reply: `Our trip experts are available ${site.hours}. Call ${site.phone}, WhatsApp us, or request a callback and we'll ring you.`,
      actions: [
        { label: `Call ${site.phone}`, href: site.phoneHref },
        { label: "WhatsApp us", href: `https://wa.me/${site.whatsapp}` },
        { label: "Request callback", href: "/contact#callback" },
      ],
    };
  }

  const destinations = await listDestinations();
  const dest = destinations.find(
    (d) => text.includes(d.name.toLowerCase()) || text.includes(d.slug.replace(/-/g, " ")) || d.country.toLowerCase().split(/[·,]/).some((c) => c.trim().length > 3 && text.includes(c.trim())),
  );

  if (/\bvisa\b/.test(text)) {
    if (dest) {
      const full = await getDestinationBySlug(dest.slug);
      return {
        reply: `Visa for ${dest.name}: ${full?.visaInfo || "requirements vary — ask our team."} Our visa desk handles the paperwork for you.`,
        actions: [{ label: `Explore ${dest.name}`, href: `/destinations/${dest.slug}` }],
      };
    }
    return { reply: "Our visa desk assists with Dubai, Thailand, Bali, Singapore, Schengen (Europe), Japan, Vietnam and more — documentation, forms, appointments and insurance. Which country are you heading to?", quickReplies: ["Dubai visa", "Europe visa", "Japan visa"] };
  }

  const faq = (k: RegExp, idx: number) => (k.test(text) ? faqs[idx] : null);
  const f = faq(/\b(cancel|refund)/, 3) ?? faq(/\b(pay|payment|advance|emi|upi)/, 1) ?? faq(/\binsurance\b/, 6) ?? faq(/\bsolo\b/, 5);
  if (f) return { reply: f.a, actions: [{ label: "Read all FAQs", href: "/contact#faq" }] };

  if (/\b(custom|customi[sz]e|tailor|plan my|personali[sz]e)/.test(text)) {
    return { reply: "Love that! Our Trip Planner takes 60 seconds — tell us where, when, who and your budget and we'll design a personalised itinerary.", actions: [{ label: "Open Trip Planner", href: "/plan-my-trip" }] };
  }

  if (/\b(deal|offer|discount|sale|cheap)/.test(text) && !dest) {
    const deals = await getDeals(3);
    return {
      reply: deals.length ? "These limited-time deals are hot right now 🔥" : "No flash deals right now, but here are our best-value trips.",
      packages: toCards(deals.length ? deals : await listPackages({ sort: "price-asc" })),
      actions: [{ label: "See all packages", href: "/packages?sort=price-asc" }],
    };
  }

  if (/\b(group|fixed departure|departures)\b/.test(text) && !dest) {
    const deps = await getUpcomingDepartures(4);
    return {
      reply:
        "Upcoming group departures:\n" +
        deps.map((d) => `• ${d.title} — ${formatDate(d.startDate)} (${d.totalSeats - d.bookedSeats} seats left)`).join("\n"),
      actions: [{ label: "All group tours", href: "/group-tours" }],
    };
  }

  const filters: PackageFilters = {};
  if (dest) filters.destination = dest.slug;
  const theme = Object.entries(themeWords).find(([, words]) => words.some((w) => text.includes(w)))?.[0];
  if (theme) filters.theme = theme;
  const budget = parseBudget(text);
  if (budget) filters.maxPrice = budget;
  const days = text.match(/(\d{1,2})\s*(?:days?|d\b)/)?.[1];
  const nights = text.match(/(\d{1,2})\s*(?:nights?|n\b)/)?.[1];
  if (days || nights) {
    const d = days ? Number(days) : Number(nights) + 1;
    filters.duration = `${Math.max(1, d - 1)}-${d + 1}`;
  }
  if (!dest) {
    if (/\b(international|abroad|foreign|overseas|outside india)\b/.test(text)) filters.type = "international";
    else if (/\b(domestic|india|within india)\b/.test(text)) filters.type = "domestic";
  }

  if (Object.keys(filters).length) {
    let rows = await listPackages({ ...filters, sort: "rating" });
    let note = "";
    if (!rows.length && filters.maxPrice) {
      rows = await listPackages({ ...filters, maxPrice: undefined, sort: "price-asc" });
      if (rows.length) note = ` Nothing fits under ${formatINR(filters.maxPrice)} yet — here are the closest options.`;
    }
    if (rows.length) {
      const what = [theme && themes.find((t) => t.id === theme)?.label.toLowerCase(), dest?.name, filters.type].filter(Boolean).join(" · ");
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
      return {
        reply: `Here ${rows.length === 1 ? "is a trip" : `are ${Math.min(rows.length, 3)} trips`} I'd recommend${what ? ` for ${what}` : ""}.${note} Prices are per person.`,
        packages: toCards(rows),
        actions: [{ label: `View all ${rows.length} match${rows.length > 1 ? "es" : ""}`, href: `/packages?${params}` }],
      };
    }
    if (dest) {
      return {
        reply: `We don't have a ready package for ${dest.name} matching that yet — but we can build one just for you!`,
        actions: [{ label: "Plan a custom trip", href: "/plan-my-trip" }],
      };
    }
  }

  return {
    reply:
      "I can find packages by destination, budget, duration or trip style, share visa info, explain payments & cancellations, or connect you to a human expert. Try “Bali honeymoon under 70k” or “5 day family trip in India”.",
    quickReplies: QUICK,
  };
}

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };
    return NextResponse.json(await answer(String(message ?? "").slice(0, 300)));
  } catch {
    return NextResponse.json({ reply: "Oops, something went wrong. Please try again or call us.", actions: [{ label: "Call us", href: site.phoneHref }] } satisfies Reply);
  }
}
