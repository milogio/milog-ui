import { NextResponse } from "next/server";
import { clearSession, MiLogServerError, readSession, validateSessionServer, writeSession } from "@/lib/milogServer";

export async function GET() {
  try {
    const session = await readSession();
    if (!session) return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
    const verified = await validateSessionServer(session);
    await writeSession(verified);

    return NextResponse.json({ user: verified.user, tenant: verified.tenant });
  } catch (error) {
    const status = error instanceof MiLogServerError ? error.status : 500;
    if (status === 401 || status === 403) await clearSession();
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to verify session." },
      { status },
    );
  }
}
