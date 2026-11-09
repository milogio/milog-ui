import { NextResponse } from "next/server";
import { clearSession, logoutServer, MiLogServerError, readSession, validateSessionServer } from "@/lib/milogServer";
import { assertSameOrigin } from "@/lib/requestOrigin";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Request rejected." }, { status: 403 });
  }
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
