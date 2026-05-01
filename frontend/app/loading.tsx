export default function Loading() {
  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <div className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-6">
        <div className="h-3 w-40 rounded-full bg-muted/70" />
        <div className="mt-3 h-8 w-72 rounded-xl bg-muted/70" />
        <div className="mt-2 h-4 w-3/4 rounded-full bg-muted/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border/70 bg-card/80 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:col-span-2">
          <div className="h-4 w-36 animate-pulse rounded bg-muted/60" />
          <div className="mt-4 h-[240px] animate-pulse rounded-xl bg-muted/45" />
        </div>
        <div className="h-80 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="h-4 w-28 animate-pulse rounded bg-muted/60" />
          <div className="mt-4 space-y-3">
            <div className="h-12 animate-pulse rounded-lg bg-muted/45" />
            <div className="h-12 animate-pulse rounded-lg bg-muted/45" />
            <div className="h-12 animate-pulse rounded-lg bg-muted/45" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:col-span-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
          <div className="mt-4 h-[200px] animate-pulse rounded-xl bg-muted/45" />
        </div>
        <div className="h-72 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
          <div className="mt-4 h-[200px] animate-pulse rounded-xl bg-muted/45" />
        </div>
      </div>
    </div>
  );
}