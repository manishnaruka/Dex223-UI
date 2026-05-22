import Skeleton from "@repo/ui/skeleton";

export default function ClaimCenterLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      <div className="flex items-center justify-between gap-2 md:gap-3">
        <Skeleton className="h-9 flex-1 rounded-2 md:h-10 md:max-w-[420px] lg:max-w-[480px]" />
        <Skeleton className="h-9 w-[86px] rounded-2 md:h-10 md:w-20 md:rounded-3" />
      </div>

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-36 rounded-2 md:h-8 md:w-56" />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-5 md:gap-3">
              <Skeleton className="h-10 rounded-2 md:h-12" />
              <Skeleton className="h-10 rounded-2 md:h-12" />
              <Skeleton className="col-span-2 h-10 rounded-2 sm:col-span-1 md:h-12" />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_68px] gap-2 sm:grid-cols-2 md:gap-3 lg:w-[460px]">
            <Skeleton className="h-20 rounded-3" />
            <Skeleton className="h-20 rounded-3" />
            <Skeleton className="col-span-2 h-16 rounded-3 sm:hidden" />
          </div>
        </div>
      </div>

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-32 rounded-2 md:h-7 md:w-44" />
            <Skeleton className="mt-2 h-3 w-full max-w-[520px] rounded-2 md:mt-3 md:h-4" />
          </div>
          <Skeleton className="hidden h-10 w-28 rounded-3 sm:block" />
        </div>
        <div className="mt-3 grid gap-2.5 md:mt-4 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
          <Skeleton className="h-[100px] rounded-3 md:h-28" />
          <Skeleton className="h-[100px] rounded-3 md:h-28" />
          <Skeleton className="h-[100px] rounded-3 md:col-span-2 md:h-28 xl:col-span-1" />
        </div>
      </div>

      <Skeleton className="h-[90px] rounded-3 md:h-24" />

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-32 rounded-2 md:h-7 md:w-40" />
            <Skeleton className="mt-2 h-3 w-full max-w-[520px] rounded-2 md:mt-3 md:h-4" />
          </div>
          <Skeleton className="hidden h-10 w-32 rounded-3 sm:block" />
        </div>
        <div className="mt-3 grid gap-2 md:mt-4 md:grid-cols-3 md:gap-3">
          <Skeleton className="h-16 rounded-3" />
          <Skeleton className="h-16 rounded-3" />
          <Skeleton className="h-16 rounded-3" />
        </div>
      </div>
    </div>
  );
}
