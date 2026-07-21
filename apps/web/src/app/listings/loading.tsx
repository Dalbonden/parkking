// Streaming fallback for the DB-backed search results. Scoped to /listings (and
// its detail pages) on purpose: a root-level loading boundary would flush the
// shell before auth redirects (redirect()/notFound()) run, turning gated routes
// into streamed 200s. Public listing pages have no such redirect, so streaming
// here is a pure win.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4">
            <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
