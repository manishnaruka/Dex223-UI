import Skeleton from "@repo/ui/skeleton";

export default function SocialQuestsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      <div className="flex items-center justify-between gap-2 md:gap-3">
        <Skeleton className="h-9 flex-1 rounded-2 md:h-10 md:max-w-[420px] lg:max-w-[480px]" />
        <Skeleton className="h-8 w-20 rounded-2 md:h-10 md:w-24" />
      </div>

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
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

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-7 w-36 rounded-2" />
            <Skeleton className="mt-3 h-4 w-full max-w-[520px] rounded-2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-20" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Skeleton className="h-20 rounded-3" />
          <Skeleton className="h-20 rounded-3" />
          <Skeleton className="h-20 rounded-3" />
        </div>
      </div>

      <div className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
        <Skeleton className="h-7 w-24 rounded-2" />
        <Skeleton className="mt-3 h-4 w-full max-w-[760px] rounded-2" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-[158px] rounded-3" key={index} />
          ))}
        </div>
        <Skeleton className="mt-4 h-4 w-full max-w-[640px] rounded-2" />
      </div>
    </div>
  );
}
