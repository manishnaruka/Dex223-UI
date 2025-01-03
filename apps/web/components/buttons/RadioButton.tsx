import clsx from "clsx";
import React, { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  onClick: () => void;
  bgColor?: "bg-tertiary-bg" | "bg-quaternary-bg";
}

export default function RadioButton({
  isActive,
  children,
  className,
  bgColor = "bg-quaternary-bg",
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      className={clsxMerge(
        "duration-200 items-center text-14 md:text-16 pt-3 pb-3 min-h-12 flex px-4 md:px-4 lg:px-5 rounded-3 group gap-x-2 md:gap-2  disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "text-primary-text"
          : "text-secondary-text hocus:bg-green-bg  hocus:text-primary-text",
        bgColor,
        className,
      )}
      {...props}
    >
      <span
        className={clsx(
          "m-0 box-border flex-shrink-0 duration-200 w-4 h-4 rounded-full border-[3px] relative border-secondary-bg outline outline-1 ",
          isActive
            ? "outline-green bg-green"
            : "bg-secondary-bg outline-secondary-border group-hocus:outline-green",
        )}
      ></span>
      {children}
    </button>
  );
}
