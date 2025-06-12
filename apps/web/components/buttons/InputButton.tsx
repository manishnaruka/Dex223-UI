import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

import { ThemeColors } from "@/config/theme/colors";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isActive: boolean;
  colorScheme: ThemeColors.GREEN;
}

export default function InputButton({
  text,
  isActive,
  colorScheme = ThemeColors.GREEN,
  ...props
}: Props) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "rounded-5 px-2 text-12 py-0.5 border  duration-200",
        {
          [ThemeColors.GREEN]: "hocus:bg-green-bg",
          [ThemeColors.PURPLE]: "hocus:bg-purple-bg",
        }[colorScheme],
        isActive
          ? {
              [ThemeColors.GREEN]: "text-green shadow shadow-green/60 border-green bg-green-bg",
              [ThemeColors.PURPLE]:
                "text-purple shadow shadow-purple/60 border-purple bg-purple-bg",
            }[colorScheme]
          : {
              [ThemeColors.GREEN]: "text-green bg-tertiary-bg border-transparent ",
              [ThemeColors.PURPLE]: "text-purple bg-tertiary-bg border-transparent ",
            }[colorScheme],
      )}
    >
      {text}
    </button>
  );
}
