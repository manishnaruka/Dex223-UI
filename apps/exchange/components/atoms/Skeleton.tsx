import { HTMLAttributes } from "react";

import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends HTMLAttributes<HTMLDivElement> {
  shape?: "rect" | "circle";
  animationDuration?: string;
}

export default function Skeleton({ shape = "rect", animationDuration = "1.5s", className }: Props) {
  return (
    <div
      className={clsxMerge(
        "bg-primary-bg relative overflow-hidden before:animate-shimmer before:absolute before:top-0 before:left-[-100%] before:w-[200%] before:h-full before:bg-gradient-to-r before:from-transparent before:via-quaternary-bg before:to-transparent",
        shape === "rect" ? "rounded-20" : "rounded-full",
        className,
      )}
      style={{ animationDuration }}
    />
  );
}
