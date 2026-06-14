export function BoardSkeleton() {
  return (
    <div className="h-full animate-pulse p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="h-8 w-40 rounded-lg bg-zinc-800/80" />
          <div className="mt-2 h-4 w-24 rounded-md bg-zinc-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-lg bg-zinc-800/60" />
          <div className="h-9 w-28 rounded-lg bg-zinc-800/60" />
          <div className="h-9 w-24 rounded-lg bg-violet-500/20" />
        </div>
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="mb-4 break-inside-avoid rounded-xl border border-zinc-800/80 bg-card/40 p-4"
            style={{ height: index % 3 === 0 ? "11rem" : index % 3 === 1 ? "9rem" : "13rem" }}
          >
            <div className="mb-3 flex items-start gap-2">
              <div className="h-5 w-5 rounded-md bg-zinc-800/80" />
              <div className="h-4 flex-1 rounded-md bg-zinc-800/80" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-zinc-800/60" />
              <div className="h-3 w-5/6 rounded bg-zinc-800/60" />
              <div className="h-3 w-2/3 rounded bg-zinc-800/60" />
            </div>
            <div className="mt-4 border-t border-zinc-800/50 pt-3">
              <div className="h-3 w-16 rounded bg-zinc-800/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
