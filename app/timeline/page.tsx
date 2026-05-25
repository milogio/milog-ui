import { redirect } from "next/navigation";
import { TimelinePage } from "@/components/TimelinePage";
import { readSession } from "@/lib/milogServer";
import { searchParamsToFilters } from "@/lib/urlState";

export default async function TimelineRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await readSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  return <TimelinePage initialFilters={searchParamsToFilters(params)} />;
}
