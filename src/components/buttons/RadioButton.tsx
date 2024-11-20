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
        "duration-200 text-14 md:text-16 h-10 flex px-3 md:px-4 lg:px-5 items-center rounded-2 group gap-2  disabled:pointer-events-none disabled:opacity-50",
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
          "flex-shrink-0 duration-200 w-4 h-4 rounded-full border relative ",
          bgColor,
          isActive ? "border-green" : "border-secondary-border group-hocus:border-green",
        )}
      >
        <span
          className={clsx(
            "duration-200 w-2.5 h-2.5 rounded-full bg-green absolute inset-0 m-auto",
            isActive ? "opacity-100 shadow shadow-green/60" : "opacity-0",
          )}
        />
      </span>
      {children}
    </button>
  );
}
