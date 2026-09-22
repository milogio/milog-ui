import { NextResponse } from "next/server";
import { clearSession, getTimelineServer, MiLogServerError, readSession } from "@/lib/milogServer";
import { searchParamsToFilters, timelineFilterValidationMessage } from "@/lib/urlState";

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const validationMessage = timelineFilterValidationMessage(url.searchParams);
    if (validationMessage) {
      return NextResponse.json({ message: validationMessage }, { status: 400 });
    }
    const filters = searchParamsToFilters(url.searchParams);
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const page = await getTimelineServer(filters, session, cursor);
    return NextResponse.json(page);
  } catch (error) {
    const status = error instanceof MiLogServerError ? error.status : 500;
    if (status === 401) await clearSession();
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load timeline." },
      { status },
    );
  }
}
