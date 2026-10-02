import { NextResponse } from "next/server";
import { clearSession, logoutServer, MiLogServerError, readSession, validateSessionServer } from "@/lib/milogServer";

export async function POST() {
  try {
    const session = await readSession();
    await logoutServer(session ? await validateSessionServer(session) : null);
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
