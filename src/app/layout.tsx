import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AppProvider } from "@/components/providers/AppProvider";
import { CURRENCY_COOKIE, currencies, site, type CurrencyCode } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Domestic & International Tour Packages`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["tour packages", "holiday packages", "honeymoon packages", "group tours", "international tours", "India tours", "Explore Bound Holidays"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#03050c",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(CURRENCY_COOKIE)?.value as CurrencyCode | undefined;
  const currency: CurrencyCode = saved && saved in currencies ? saved : "INR";
  return (
    <html lang="en-IN">
      <body className="min-h-dvh">
        <AppProvider initialCurrency={currency}>
          <SmoothScroll />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
