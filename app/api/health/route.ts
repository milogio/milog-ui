import { NextResponse } from "next/server";
import { readRuntimeConfig } from "@/lib/runtimeConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { apiUrl } = readRuntimeConfig();
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    const apiReachable = response.status < 500;
    return NextResponse.json(
      { status: apiReachable ? "ok" : "unavailable", checks: { configuration: "ok", api: apiReachable ? "reachable" : "unavailable" } },
      { status: apiReachable ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { status: "unavailable", checks: { configuration: "invalid", api: "unknown" }, message: error instanceof Error ? error.message : "Health check failed." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
