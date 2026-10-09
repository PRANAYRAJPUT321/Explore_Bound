import { NextResponse } from "next/server";
import { searchSuggestions } from "@/db/queries";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 60) ?? "";
  if (q.trim().length < 2) return NextResponse.json({ packages: [], destinations: [] });
  return NextResponse.json(await searchSuggestions(q));
}
