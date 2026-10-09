import { NextResponse } from "next/server";
import { getPackagesByIds } from "@/db/queries";

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 50);
  const rows = await getPackagesByIds(ids);
  // keep the caller's order (most recently saved first)
  rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  return NextResponse.json(rows);
}
