import { decodeShareState } from "@/lib/shareState";
import { TimelinePage } from "@/components/TimelinePage";
import { ErrorState } from "@/components/ErrorState";

export default async function SharedTimelinePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const filters = decodeShareState(shareId);

  if (!filters) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState
          title="Invalid share link"
          description="This MiLog share token could not be decoded. Generate a fresh link from the timeline page."
        />
      </main>
    );
  }

  return <TimelinePage initialFilters={filters} readOnly title="Shared timeline" subtitle="Read-only view" />;
}
