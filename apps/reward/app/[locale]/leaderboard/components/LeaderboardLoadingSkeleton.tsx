import Skeleton from "@repo/ui/skeleton";

export default function LeaderboardLoadingSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3 md:gap-5">
      <div className="flex xl:hidden items-center gap-3">
        <Skeleton className="h-10 flex-1 rounded-3" />
        <Skeleton className="h-10 w-24 rounded-3" />
      </div>
      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <Skeleton className="h-7 w-48 rounded-2" />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Skeleton className="h-12 rounded-2" />
          <Skeleton className="h-12 rounded-2" />
          <Skeleton className="h-12 rounded-2" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Skeleton className="h-16 rounded-3" />
          <Skeleton className="h-16 rounded-3" />
          <Skeleton className="h-16 rounded-3" />
        </div>
      </div>
      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-40 rounded-2" />
          <Skeleton className="h-10 w-28 rounded-3" />
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-3" />
        <div className="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-3 2xl:grid-cols-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-3 2xl:h-11" />
          ))}
        </div>
      </div>
    </div>
  );
}
