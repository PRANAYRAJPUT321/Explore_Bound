/**
 * Business details for Explore Bound Holidays.
 * ✏️ Replace the placeholder contact details & numbers below with your real ones.
 */
export const site = {
  name: "Explore Bound Holidays",
  shortName: "Explore Bound",
  tagline: "Journeys beyond boundaries",
  description:
    "Explore Bound Holidays crafts unforgettable domestic & international tour packages, honeymoons, group tours and custom trips — with immersive planning and 24×7 support.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Contact (placeholders — update these!)
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  whatsapp: "919876543210",
  email: "hello@explorebound.com",
  address: "Explore Bound Holidays, 2nd Floor, Travel House, Main Road, India",
  hours: "Mon – Sat · 9:30 AM – 8:00 PM IST",
  mapEmbed: "https://www.google.com/maps?q=India&output=embed",
  socials: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
    x: "https://x.com/",
  },
  // Trust numbers shown on the home page (update with your real figures)
  stats: [
    { value: 12000, suffix: "+", label: "Happy travellers" },
    { value: 150, suffix: "+", label: "Curated itineraries" },
    { value: 40, suffix: "+", label: "Destinations" },
    { value: 9, suffix: " yrs", label: "Crafting journeys" },
  ],
  // Where flight arcs start on the 3D globe
  hub: { name: "India", lat: 21.1458, lng: 79.0882 },
} as const;

export const themes: { id: string; label: string; emoji: string; blurb: string }[] = [
  { id: "honeymoon", label: "Honeymoon", emoji: "💞", blurb: "Private villas, candle-light dinners & slow mornings" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", blurb: "Kid-friendly pacing, theme parks & comfy stays" },
  { id: "adventure", label: "Adventure", emoji: "🏔️", blurb: "High passes, scuba, treks & road trips" },
  { id: "group", label: "Group Tours", emoji: "🚌", blurb: "Fixed departures with a tour leader" },
  { id: "beach", label: "Beaches", emoji: "🏝️", blurb: "Turquoise water & barefoot luxury" },
  { id: "culture", label: "Culture & Heritage", emoji: "🏯", blurb: "Forts, temples, food & stories" },
  { id: "pilgrimage", label: "Pilgrimage", emoji: "🛕", blurb: "Sacred journeys with complete care" },
  { id: "luxury", label: "Luxury", emoji: "✨", blurb: "5★ stays and once-in-a-lifetime moments" },
  { id: "friends", label: "Friends", emoji: "🎉", blurb: "Parties, road trips & shared stories" },
  { id: "nature", label: "Nature", emoji: "🌿", blurb: "Valleys, lakes, forests & wildlife" },
  { id: "weekend", label: "Weekend Getaways", emoji: "🧳", blurb: "Short escapes, big memories" },
  { id: "wellness", label: "Wellness", emoji: "🧘", blurb: "Ayurveda, yoga & slow travel" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", blurb: "Souks, malls & night markets" },
];

export const themeLabel = (id: string) => themes.find((t) => t.id === id)?.label ?? id;

export const faqs: { q: string; a: string }[] = [
  {
    q: "How do I book a package?",
    a: "Open any package, choose your date, hotel category and travellers, then click “Book now”. You will get a booking reference instantly and a trip expert confirms availability within a few hours.",
  },
  {
    q: "How much do I need to pay to confirm?",
    a: "Just 25% of the package value confirms your booking. The balance is due 21 days before departure. We accept UPI, cards, net banking and bank transfer through a secure payment link.",
  },
  {
    q: "Can I customise an itinerary?",
    a: "Absolutely — every package can be tailored. Use “Plan My Trip” or tell us on WhatsApp what you would like to add, remove or upgrade.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellations 30+ days before departure: 10% of the package cost. 15–29 days: 25%. 7–14 days: 50%. Under 7 days: non-refundable. Airline and visa fees follow their own rules.",
  },
  {
    q: "Do you help with visas for international trips?",
    a: "Yes. Our visa desk guides you with documentation, forms, appointments and insurance for Dubai, Thailand, Bali, Singapore, Schengen, Japan and more.",
  },
  {
    q: "Are group tours suitable for solo travellers?",
    a: "Group departures are perfect for solo travellers — you share the experience with like-minded people and a tour leader handles everything. We can also match you with a room-mate to avoid single supplements.",
  },
  {
    q: "Is travel insurance included?",
    a: "International packages include travel insurance. For domestic trips you can add it as an add-on during booking.",
  },
];

export const currencies = {
  INR: { symbol: "₹", rate: 1, locale: "en-IN" },
  USD: { symbol: "$", rate: 0.012, locale: "en-US" },
  EUR: { symbol: "€", rate: 0.0104, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.0089, locale: "en-GB" },
  AED: { symbol: "AED ", rate: 0.044, locale: "en-AE" },
} as const;

export type CurrencyCode = keyof typeof currencies;
export const CURRENCY_COOKIE = "eb_currency";
