import { HTMLAttributes } from "react";

import { clsxMerge } from "../functions/clsxMerge";

interface Props extends HTMLAttributes<HTMLDivElement> {
  shape?: "rect" | "circle";
  animationDuration?: string;
}

export default function Skeleton({ shape = "rect", animationDuration = "1.5s", className }: Props) {
  return (
    <div
      className={clsxMerge(
        "ui-bg-primary-bg ui-relative ui-overflow-hidden before:ui-animate-shimmer before:ui-absolute before:ui-top-0 before:ui-left-[-100%] before:ui-w-[200%] before:ui-h-full before:ui-bg-gradient-to-r before:ui-from-transparent before:ui-via-quaternary-bg before:ui-to-transparent",
        shape === "rect" ? "rounded-20" : "rounded-full",
        className,
      )}
      style={{ animationDuration }}
    />
  );
}
