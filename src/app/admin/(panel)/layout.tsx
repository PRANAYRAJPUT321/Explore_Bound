import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/ui/Icons";
import { getDashboardStats } from "@/db/queries";
import { logout } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Explore Bound" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const s = await getDashboardStats();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-ink-900 p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:p-5">
        <div className="mb-4 flex items-center justify-between lg:mb-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <span>
              <span className="block font-display font-bold">Explore Bound</span>
              <span className="block text-[11px] text-white/45">Admin console</span>
            </span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button className="rounded-full bg-white/5 p-2 text-white/60" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
        <AdminNav counts={{ bookings: s.pendingBookings, enquiries: s.newEnquiries, reviews: s.pendingReviews, feedback: s.newFeedback }} />
        <div className="absolute right-5 bottom-5 left-5 hidden lg:block">
          <div className="truncate text-xs text-white/40">{session.email}</div>
          <form action={logout}>
            <button className="mt-2 flex items-center gap-2 text-sm text-white/60 hover:text-white">
              <LogOut size={15} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
