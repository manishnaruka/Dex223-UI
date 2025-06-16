import { ButtonHTMLAttributes, PropsWithChildren } from "react";

import Svg from "@/components/atoms/Svg";
import { ThemeColors } from "@/config/theme/colors";
import { IconName } from "@/config/types/IconName";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  colorScheme?: ThemeColors;
  endIcon?: IconName;
}

export default function TextButton({
  colorScheme = ThemeColors.GREEN,
  endIcon,
  children,
  className,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      className={clsxMerge(
        "disabled:opacity-50 disabled:pointer-events-none disabled:text-tertiary-text rounded-2 flex items-center justify-center gap-2 px-6 duration-200",
        "text-secondary-text ",
        {
          [ThemeColors.GREEN]: "hocus:text-green-hover",
          [ThemeColors.PURPLE]: "hocus:text-purple-hover",
        }[colorScheme],
        className,
      )}
      {...props}
    >
      {children}
      {endIcon && <Svg iconName={endIcon} />}
    </button>
  );
}
