export default function PrivacyLoading() {
  return (
    <div className="min-h-screen bg-background pt-[74px] animate-pulse">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="mb-12 space-y-4">
          <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-12 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-40 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-20 w-full rounded-[12px] bg-zinc-100 dark:bg-zinc-800 mt-4" />
        </div>
        <div className="space-y-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-4/6 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
