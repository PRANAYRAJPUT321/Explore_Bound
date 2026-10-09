import { adminListSubscribers } from "@/db/queries";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });
  const rows = await adminListSubscribers();
  // Neutralise spreadsheet formula injection (=, +, -, @) and escape quotes.
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const csv = ["email,subscribed_at", ...rows.map((r) => `${cell(r.email)},${r.createdAt.toISOString()}`)].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="explorebound-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
