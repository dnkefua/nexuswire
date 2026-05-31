import { NextResponse } from "next/server";
import { getFeedCatalog } from "@/lib/rss";

export async function GET() {
  return NextResponse.json({ feeds: getFeedCatalog() });
}
