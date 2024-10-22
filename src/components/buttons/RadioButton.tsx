import clsx from "clsx";
import React, { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  onClick: () => void;
}

export default function RadioButton({
  isActive,
  children,
  className,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      className={clsxMerge(
        "duration-200 text-14 md:text-16 h-10 flex px-3 md:px-4 lg:px-5 items-center rounded-2 group hover:shadow hover:shadow-green/60 gap-2 bg-tertiary-bg hover:text-primary-text disabled:pointer-events-none disabled:opacity-50",
        isActive ? "text-primary-text" : "text-secondary-text",
        className,
      )}
      {...props}
    >
      <span
        className={clsx(
          "duration-200 w-4 h-4 rounded-full border flex items-center bg-tertiary-bg justify-center group-hover:border-green",
          isActive ? "border-green" : "border-secondary-border",
        )}
      >
        <span
          className={clsx(
            "duration-200 w-2.5 h-2.5 rounded-full bg-green",
            isActive ? "opacity-100 shadow shadow-green/60" : "opacity-0",
          )}
        />
      </span>
      {children}
    </button>
  );
}
