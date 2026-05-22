import { clsxMerge } from "@/functions/clsxMerge";

export default function PointsMeter({
  points,
  maxPoints,
  className,
}: {
  points: number;
  maxPoints: number;
  className?: string;
}) {
  return (
    <span className={clsxMerge("flex min-w-0 items-center gap-2", className)}>
      <span className="shrink-0 tabular-nums">{points}</span>
      <span className="h-1.5 w-[72px] shrink-0 rounded-20 bg-secondary-bg">
        <span
          className="block h-1.5 rounded-20 bg-gradient-progress-bar-green"
          style={{ width: `${Math.max(8, Math.round((points / maxPoints) * 100))}%` }}
        />
      </span>
    </span>
  );
}
