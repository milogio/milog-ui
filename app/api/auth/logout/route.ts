import { NextResponse } from "next/server";
import { clearSession } from "@/lib/milogServer";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
