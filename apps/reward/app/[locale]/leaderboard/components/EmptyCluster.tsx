import EmptyStateIcon from "@/components/atoms/EmptyStateIconNew";

export default function EmptyCluster() {
  return (
    <div className="relative flex min-h-[172px] items-center justify-center overflow-hidden rounded-3 bg-primary-bg px-4 text-center md:min-h-[240px] lg:min-h-[300px]">
      <EmptyStateIcon
        iconName="wallet"
        size={150}
        className="absolute -bottom-3 -right-8 opacity-25 md:size-[220px] lg:size-[260px]"
      />
      <span className="relative z-10 max-w-[460px] text-14 text-secondary-text md:text-16">
        Earn your first points to be placed in a cluster on the leaderboard
      </span>
    </div>
  );
}
