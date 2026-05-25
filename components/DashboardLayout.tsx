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
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
      <div className="hidden lg:block">{filters}</div>
      <div className="min-w-0">{main}</div>
      <div>{details}</div>
    </div>
  );
}
