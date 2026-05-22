import Skeleton from "@repo/ui/skeleton";

export default function HistoryLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      <Skeleton className="h-4 w-40 rounded-2" />

      <Skeleton className="h-[88px] w-full rounded-3" />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
        <Skeleton className="h-10 rounded-2" />
        <Skeleton className="h-10 rounded-2" />
        <Skeleton className="h-10 rounded-2" />
        <Skeleton className="h-10 rounded-2" />
      </div>

      <section className="rounded-3 bg-primary-bg p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-32 rounded-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-2" />
            <Skeleton className="h-8 w-16 rounded-2" />
          </div>
        </div>
        <Skeleton className="mt-3 h-4 w-72 rounded-2" />
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-10 rounded-2" />
          <Skeleton className="h-12 rounded-2" />
          <Skeleton className="h-12 rounded-2" />
          <Skeleton className="h-12 rounded-2" />
          <Skeleton className="h-12 rounded-2" />
        </div>
      </section>

      <section className="rounded-3 bg-primary-bg p-4 md:p-5 lg:p-6">
        <Skeleton className="h-7 w-40 rounded-2" />
        <Skeleton className="mt-3 h-4 w-80 rounded-2" />
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
          <Skeleton className="h-16 rounded-2" />
          <Skeleton className="h-16 rounded-2" />
          <Skeleton className="h-16 rounded-2" />
          <Skeleton className="h-16 rounded-2" />
          <Skeleton className="h-16 rounded-2" />
          <Skeleton className="h-16 rounded-2" />
          <Skeleton className="h-16 rounded-2" />
        </div>
      </section>

      <section className="rounded-3 bg-primary-bg p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-36 rounded-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-2" />
            <Skeleton className="h-8 w-16 rounded-2" />
          </div>
        </div>
        <Skeleton className="mt-3 h-4 w-72 rounded-2" />
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-10 rounded-2" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-2" />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </section>

      <section className="rounded-3 bg-primary-bg p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-40 rounded-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-2" />
            <Skeleton className="h-8 w-16 rounded-2" />
            <Skeleton className="h-8 w-16 rounded-2" />
          </div>
        </div>
        <Skeleton className="mt-3 h-4 w-56 rounded-2" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-10 rounded-2" />
          <Skeleton className="h-10 rounded-2" />
          <Skeleton className="h-10 rounded-2" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-2" />
          <Skeleton className="h-10 rounded-2" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-10 rounded-2" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2" />
          ))}
        </div>
        <Skeleton className="mt-4 h-4 w-32 rounded-2" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-2" />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
