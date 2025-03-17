import { ButtonHTMLAttributes, ReactNode } from "react";

import { clsxMerge } from "../functions/clsxMerge";

export const enum ButtonVariant {
  CONTAINED = "contained",
  OUTLINED = "outlined",
}

export const enum ButtonSize {
  EXTRA_SMALL = 20,
  SMALL = 32,
  MEDIUM = 40,
  LARGE = 48,
  EXTRA_LARGE = 60,
}

export const enum ButtonColor {
  GREEN,
  RED,
  LIGHT_GREEN,
  LIGHT_RED,
  LIGHT_YELLOW,
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorScheme?: ButtonColor;
  mobileSize?: ButtonSize;
  tabletSize?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  CommonProps &
  (
    | {
        endIcon?: ReactNode;
        startIcon?: never;
      }
    | { startIcon?: ReactNode; endIcon?: never }
  );

const buttonVariantClassnameMap: Record<ButtonVariant, Record<ButtonColor, string>> = {
  [ButtonVariant.CONTAINED]: {
    [ButtonColor.RED]: "ui-bg-red ui-text-primary-text hocus:ui-bg-red-hover",
    [ButtonColor.GREEN]: "ui-bg-green ui-text-black hocus:ui-bg-green-hover",
    [ButtonColor.LIGHT_RED]:
      "ui-bg-red-bg ui-text-secondary-text ui-border-transparent ui-border hocus:ui-border-red-light hocus:ui-bg-red-bg-hover hocus:ui-text-primary-text",
    [ButtonColor.LIGHT_YELLOW]:
      "ui-bg-yellow-bg ui-text-secondary-text ui-border-transparent ui-border hocus:ui-border-yellow-light hocus:ui-bg-yellow-bg-hover hocus:ui-text-primary-text",
    [ButtonColor.LIGHT_GREEN]:
      "ui-bg-green-bg ui-text-secondary-text ui-border-transparent ui-border hocus:ui-border-green hocus:ui-bg-green-bg-hover hocus:ui-text-primary-text",
  },
  [ButtonVariant.OUTLINED]: {
    [ButtonColor.RED]:
      "ui-border ui-border-primary ui-text-secondary-text hocus:ui-bg-red-bg hocus:ui-border-primary-text hocus:ui-text-primary-text",
    [ButtonColor.GREEN]: "ui-border ui-border-green ui-text-primary-text hocus:ui-bg-green-bg",
    [ButtonColor.LIGHT_RED]: "ui-bg-red-light ui-text-black hocus:ui-bg-red-hover",
    [ButtonColor.LIGHT_YELLOW]: "ui-bg-yellow-light ui-text-black hocus:ui-bg-red-hover",
    [ButtonColor.LIGHT_GREEN]:
      "ui-bg-green-bg ui-text-primary-text ui-border-transparent ui-border hocus:ui-border-green",
  },
};

const buttonSizeClassnameMap: Record<ButtonSize, string> = {
  [ButtonSize.EXTRA_SMALL]: "lg:ui-text-12 lg:ui-min-h-5 lg:ui-rounded-20 lg:ui-px-4",
  [ButtonSize.SMALL]: "lg:ui-text-14 lg:ui-font-medium lg:ui-min-h-8 lg:ui-rounded-20 lg:ui-px-6",
  [ButtonSize.MEDIUM]: "lg:ui-text-16 lg:ui-font-medium lg:ui-min-h-10 lg:ui-rounded-2 lg:ui-px-6",
  [ButtonSize.LARGE]: "lg:ui-text-16 lg:ui-font-medium lg:ui-min-h-12 lg:ui-rounded-3 lg:ui-px-6",
  [ButtonSize.EXTRA_LARGE]: "lg:ui-text-18 lg:ui-font-medium lg:ui-min-h-[60px] lg:ui-rounded-3 lg:ui-px-6",
};

const tabletButtonSizeClassnameMap: Record<ButtonSize, string> = {
  [ButtonSize.EXTRA_SMALL]: "sm:ui-text-12 sm:ui-min-h-5 sm:ui-rounded-20 sm:ui-px-4",
  [ButtonSize.SMALL]: "sm:ui-text-14 sm:ui-font-medium sm:ui-min-h-8 sm:ui-rounded-20 sm:ui-px-6",
  [ButtonSize.MEDIUM]: "sm:ui-text-16 sm:ui-font-medium sm:ui-rounded-2 sm:ui-min-h-10 sm:ui-px-6",
  [ButtonSize.LARGE]: "sm:ui-text-16 sm:ui-font-medium sm:ui-rounded-3 sm:ui-min-h-12 sm:ui-px-6",
  [ButtonSize.EXTRA_LARGE]: "sm:ui-text-18 sm:ui-font-medium sm:ui-rounded-3 sm:ui-min-h-[60px] sm:ui-px-6",
};

const mobileButtonSizeClassnameMap: Record<ButtonSize, string> = {
  [ButtonSize.EXTRA_SMALL]: "ui-text-12 ui-min-h-5 ui-rounded-20 ui-px-4",
  [ButtonSize.SMALL]: "ui-text-14 ui-font-medium ui-rounded-2 ui-min-h-8 ui-px-6",
  [ButtonSize.MEDIUM]: "ui-text-16 ui-font-medium ui-rounded-2 ui-min-h-10 ui-px-6",
  [ButtonSize.LARGE]: "ui-text-16 ui-font-medium ui-rounded-3 ui-min-h-12 ui-px-6",
  [ButtonSize.EXTRA_LARGE]: "ui-text-18 ui-font-medium ui-rounded-3 ui-min-h-[60px] ui-px-6",
};

const disabledClassnameMap: Record<ButtonVariant, string> = {
  [ButtonVariant.CONTAINED]: "disabled:ui-bg-tertiary-bg disabled:ui-text-secondary-text",
  [ButtonVariant.OUTLINED]: "disabled:ui-text-secondary-text disabled:ui-border-secondary-border",
};

export default function Button({
  variant = ButtonVariant.CONTAINED,
  size = ButtonSize.LARGE,
  mobileSize,
  tabletSize,
  startIcon,
  endIcon,
  fullWidth,
  colorScheme = ButtonColor.GREEN,
  children,
  className,
  isLoading,
  ...props
}: Props) {
  const _mobileSize = mobileSize || size;
  const _tabletSize = tabletSize || size;

  return (
    <button
      className={clsxMerge(
        "ui-flex ui-items-center ui-justify-center ui-gap-2 ui-duration-200 disabled:ui-pointer-events-none",
        buttonVariantClassnameMap[variant][colorScheme],
        buttonSizeClassnameMap[size],
        tabletButtonSizeClassnameMap[_tabletSize],
        mobileButtonSizeClassnameMap[_mobileSize],
        fullWidth && "ui-w-full",
        disabledClassnameMap[variant],
        isLoading && "ui-opacity-50 ui-pointer-events-none",
        className,
      )}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}
