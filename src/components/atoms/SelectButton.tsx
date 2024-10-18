import clsx from "clsx";
import { ButtonHTMLAttributes, ForwardedRef, forwardRef, PropsWithChildren } from "react";

import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  withArrow?: boolean;
  isOpen?: boolean;
  size?: "regular" | "medium" | "large";
  fullWidth?: boolean;
  variant?: "rounded" | "rectangle";
  className?: string;
}

export const SelectButton = forwardRef(
  (
    {
      withArrow = true,
      isOpen = false,
      children,
      size = "regular",
      fullWidth = false,
      variant = "rectangle",
      className,
      ...props
    }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <button
        ref={ref}
        {...props}
        className={clsxMerge(
          "flex items-center gap-2 duration-[600ms] text-base text-primary-text hover:bg-green-bg bg-primary-bg",
          variant === "rectangle" && "rounded-2",
          variant === "rounded" &&
            "rounded-[80px] border border-transparent hover:bg-green-bg hover:shadow shadow-green/60 hover:border-green",
          isOpen && "bg-green-bg border-green",
          size === "large" && "p-2 lg:px-5 lg:py-2.5 lg:text-24 min-h-12",
          size === "regular" && "py-2 px-3",
          size === "medium" && "py-2 lg:py-3 px-3",
          fullWidth && withArrow && "w-full justify-between",
          fullWidth && !withArrow && "w-full justify-center",
          className,
        )}
      >
        {children}
        {withArrow && (
          <Svg
            className={clsx(
              "text-secondary-text",
              isOpen ? "-rotate-180" : "",
              "duration-200",
              "flex-shrink-0",
            )}
            iconName="small-expand-arrow"
          />
        )}
      </button>
    );
  },
);

SelectButton.displayName = "SelectButton";

export default SelectButton;
