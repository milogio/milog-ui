import { NextResponse } from "next/server";
import { loginServer, writeSession } from "@/lib/milogServer";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const { session } = await loginServer(body.email, body.password);
    await writeSession(session);

    return NextResponse.json({ user: session.user, tenant: session.tenant });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Login failed." },
      { status: 401 },
    );
  }
}
