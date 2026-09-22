import { NextResponse } from "next/server";
import { clearSession, logoutServer, MiLogServerError, readSession } from "@/lib/milogServer";

export async function POST() {
  try {
    await logoutServer(await readSession());
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof MiLogServerError ? error.status : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to complete logout." },
      { status },
    );
  } finally {
    await clearSession();
  }
}
