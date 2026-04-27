/** Generic page loading skeleton — matches the broad shape of every Vayb page
 *  (full-bleed hero strip, then content grid). Renders inside a Suspense
 *  boundary in {@link RootLayout}. */
export const PageSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[60vh] min-h-[420px] w-full bg-muted" />
    <div className="container space-y-6 py-12">
      <div className="h-8 w-1/3 rounded-lg bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[16/10] w-full rounded-3xl bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
