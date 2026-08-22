export function DashboardLayout({
  filters,
  main,
  details,
}: {
  filters: React.ReactNode;
  main: React.ReactNode;
  details: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
      <div className="hidden lg:block">{filters}</div>
      <div className="min-w-0">{main}</div>
      <div>{details}</div>
    </div>
  );
}
