import type { MetadataRoute } from "next";
import { listDestinations, listPackages } from "@/db/queries";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pkgs, dests] = await Promise.all([listPackages({}), listDestinations()]);
  const now = new Date();
  const staticPages = ["", "/packages", "/destinations", "/group-tours", "/plan-my-trip", "/reviews", "/contact", "/about"].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...dests.map((d) => ({ url: `${site.url}/destinations/${d.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...pkgs.map((p) => ({ url: `${site.url}/packages/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
