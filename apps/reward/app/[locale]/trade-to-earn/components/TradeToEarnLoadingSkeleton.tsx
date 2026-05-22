import Skeleton from "@repo/ui/skeleton";

export default function TradeToEarnLoadingSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-3 md:gap-5">
      <div className="flex min-w-0 items-center justify-between gap-2 md:gap-3">
        <Skeleton className="h-10 flex-1 rounded-3 md:max-w-[420px] lg:max-w-[480px]" />
        <Skeleton className="h-10 w-20 rounded-3" />
      </div>

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            <Skeleton className="h-8 w-56 rounded-2" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-12 rounded-2" />
              <Skeleton className="h-12 rounded-2" />
              <Skeleton className="h-12 rounded-2" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[460px]">
            <Skeleton className="h-20 rounded-3" />
            <Skeleton className="h-20 rounded-3" />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-5 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-7 w-32 rounded-2" />
              <Skeleton className="h-6 w-14 rounded-20" />
            </div>
            <Skeleton className="mt-3 h-4 w-full max-w-[420px] rounded-2" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-3" />
              <Skeleton className="h-20 rounded-3" />
              <Skeleton className="h-20 rounded-3" />
              <Skeleton className="h-20 rounded-3" />
              <Skeleton className="h-20 rounded-3" />
              <Skeleton className="h-20 rounded-3" />
            </div>
          </div>

          <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-7 w-32 rounded-2" />
              <Skeleton className="h-6 w-24 rounded-20" />
            </div>
            <Skeleton className="mt-3 h-4 w-full max-w-[420px] rounded-2" />
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-28 rounded-3" />
              <Skeleton className="h-28 rounded-3" />
              <Skeleton className="h-28 rounded-3" />
            </div>
            <Skeleton className="mt-4 h-16 rounded-3" />
          </div>
        </div>

        <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-28 rounded-2" />
            <Skeleton className="h-6 w-12 rounded-20" />
          </div>
          <Skeleton className="mt-3 h-4 w-full max-w-[260px] rounded-2" />
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-10 flex-1 rounded-2" />
            <Skeleton className="h-5 w-16 rounded-2" />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Skeleton className="h-14 rounded-3" />
            <Skeleton className="h-14 rounded-3" />
            <Skeleton className="h-14 rounded-3" />
            <Skeleton className="h-14 rounded-3" />
            <Skeleton className="h-14 rounded-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
