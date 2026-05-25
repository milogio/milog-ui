export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7 rounded-md bg-gradient-brand shadow-glow">
        <div className="absolute inset-[3px] flex items-center justify-center rounded-[5px] bg-background">
          <span className="font-mono text-[11px] font-bold text-gradient-brand">M</span>
        </div>
      </div>
      <span className="text-base font-semibold tracking-tight">MiLog</span>
    </div>
  );
}
