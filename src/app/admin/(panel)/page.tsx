import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BookingsChart } from "@/components/admin/BookingsChart";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminListBookings, adminListEnquiries, adminListReviews, getDashboardStats } from "@/db/queries";
import { formatDate, formatINR, timeAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const compact = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : formatINR(n);

export default async function Dashboard() {
  const [s, bookings, enquiries, reviews] = await Promise.all([getDashboardStats(), adminListBookings(), adminListEnquiries("new"), adminListReviews("pending")]);

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const row = s.monthly.find((m) => m.month === key);
    return { month: key, label: d.toLocaleString("en-IN", { month: "short" }), n: row?.n ?? 0, value: row?.value ?? 0 };
  });

  const tiles = [
    { label: "Total bookings", value: s.bookings.toLocaleString("en-IN"), sub: `${s.pendingBookings} awaiting confirmation`, href: "/admin/bookings" },
    { label: "New enquiries", value: s.newEnquiries.toLocaleString("en-IN"), sub: "Leads & callback requests", href: "/admin/enquiries" },
    { label: "Reviews to moderate", value: s.pendingReviews.toLocaleString("en-IN"), sub: "Pending approval", href: "/admin/reviews" },
    { label: "Subscribers", value: s.subscribers.toLocaleString("en-IN"), sub: `${s.activePackages} active packages`, href: "/admin/subscribers" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">Everything happening across Explore Bound, live from the database.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="card flex flex-col justify-between p-6">
          <div className="text-sm text-white/55">Confirmed & completed booking value</div>
          <div className="mt-2 text-5xl font-semibold text-white md:text-6xl">{compact(s.revenue)}</div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {tiles.map((t) => (
              <Link key={t.label} href={t.href} className="rounded-2xl border border-white/10 p-4 transition hover:border-white/25">
                <div className="text-xs text-white/50">{t.label}</div>
                <div className="mt-1 text-2xl font-semibold text-white">{t.value}</div>
                <div className="mt-0.5 text-[11px] text-white/40">{t.sub}</div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-white">Bookings per month</h2>
            <p className="text-xs text-white/45">Booking requests created, last 6 months</p>
          </div>
          <BookingsChart data={months} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Latest bookings</h2>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-xs font-semibold text-sun-300">
              All bookings <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="divide-y divide-white/5">
            {bookings.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{b.customerName}</div>
                  <div className="truncate text-xs text-white/45">
                    <span className="font-mono">{b.reference}</span> · {b.package.title} · {formatDate(b.travelDate)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold">{formatINR(b.totalAmount)}</div>
                  <StatusPill status={b.status} />
                </div>
              </li>
            ))}
            {bookings.length === 0 && <li className="py-6 text-center text-sm text-white/45">No bookings yet.</li>}
          </ul>
        </section>
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">New leads</h2>
            <Link href="/admin/enquiries" className="flex items-center gap-1 text-xs font-semibold text-sun-300">
              All enquiries <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="divide-y divide-white/5">
            {enquiries.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{e.name}</div>
                  <div className="truncate text-xs text-white/45">
                    {e.type.replace("-", " ")} · {e.destination || e.package?.title || e.message || e.phone}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-white/40">{timeAgo(e.createdAt)}</span>
              </li>
            ))}
            {enquiries.length === 0 && <li className="py-6 text-center text-sm text-white/45">Inbox zero 🎉</li>}
          </ul>
          {reviews.length > 0 && (
            <Link href="/admin/reviews" className="mt-4 block rounded-2xl bg-sun-400/10 px-4 py-3 text-sm text-sun-200">
              ★ {reviews.length} review{reviews.length > 1 ? "s" : ""} waiting for approval →
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
