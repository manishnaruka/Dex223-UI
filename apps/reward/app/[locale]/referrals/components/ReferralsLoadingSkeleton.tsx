import Skeleton from "@repo/ui/skeleton";

export default function ReferralsLoadingSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3 md:gap-4">
      <div className="flex min-w-0 items-center justify-between gap-2 md:gap-3">
        <Skeleton className="h-9 min-w-0 flex-1 rounded-3 xl:flex-none xl:w-[480px]" />
        <Skeleton className="h-9 w-[76px] shrink-0 rounded-3 md:w-24" />
      </div>
      <div className="flex min-w-0 flex-col gap-4 rounded-3 bg-primary-bg p-3 md:p-5 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Skeleton className="h-7 w-40 rounded-2" />
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
            <Skeleton className="h-12 rounded-2" />
            <Skeleton className="h-12 rounded-2" />
            <Skeleton className="col-span-2 h-12 rounded-2 sm:col-span-1" />
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:flex">
          <Skeleton className="h-20 min-w-0 rounded-3 lg:w-32" />
          <Skeleton className="h-20 min-w-0 rounded-3 lg:w-32" />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3 rounded-3 bg-primary-bg p-3 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-32 rounded-2" />
          <Skeleton className="h-6 w-24 rounded-2" />
        </div>
        <Skeleton className="h-4 w-3/4 rounded-2" />
        <Skeleton className="h-12 w-full rounded-2" />
        <Skeleton className="h-12 w-full rounded-2" />
        <Skeleton className="h-12 w-full rounded-2" />
        <Skeleton className="h-12 w-full rounded-2" />
      </div>
      <div className="flex min-w-0 flex-col gap-3 rounded-3 bg-primary-bg p-3 md:p-5">
        <Skeleton className="h-6 w-32 rounded-2" />
        <Skeleton className="h-4 w-3/4 rounded-2" />
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-12 min-w-0 flex-1 rounded-3" />
          <Skeleton className="h-12 w-12 shrink-0 rounded-3" />
        </div>
      </div>
    </div>
  );
}
