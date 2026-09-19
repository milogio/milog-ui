import { NextResponse } from "next/server";
import { getTimelineServer, readSession } from "@/lib/milogServer";
import { searchParamsToFilters } from "@/lib/urlState";

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const filters = searchParamsToFilters(url.searchParams);
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const page = await getTimelineServer(filters, session.token, cursor);
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load timeline." },
      { status: 500 },
    );
  }
}
