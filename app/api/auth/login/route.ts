import { NextResponse } from "next/server";
import { loginServer, MiLogServerError, writeSession } from "@/lib/milogServer";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; tenant_id?: string };
    if (!body.email || !body.password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const { session } = await loginServer(body.email, body.password, body.tenant_id);
    await writeSession(session);

    return NextResponse.json({ user: session.user, tenant: session.tenant });
  } catch (error) {
    const status = error instanceof MiLogServerError ? error.status : 500;
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Login failed.",
        ...(error instanceof MiLogServerError && error.details?.tenants ? { tenants: error.details.tenants } : {}),
      },
      { status },
    );
  }
}
