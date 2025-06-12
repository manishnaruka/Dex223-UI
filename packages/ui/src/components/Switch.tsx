import clsx from "clsx";
import { ChangeEvent } from "react";

enum ThemeColors {
    GREEN,
    PURPLE,
}

interface Props {
  checked: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  small?: boolean;
  disabled?: boolean;
  colorScheme?: ThemeColors;
}

export default function Switch({ checked, handleChange, small = false, disabled = false, colorScheme = ThemeColors.GREEN }: Props) {
  return (
    <label className={clsx("ui-relative ui-inline-block ui-w-12 ui-h-6")}>
      <input
        className="ui-peer ui-appearance-none"
        disabled={disabled}
        checked={checked}
        onChange={handleChange}
        type="checkbox"
      />
      <span
        className={clsx(
          `
          ui-bg-secondary-bg
                      ui-absolute
                      ui-cursor-pointer
                      ui-w-full
                      ui-h-full
                      ui-top-0
                      ui-bottom-0
                      ui-right-0
                      ui-left-0
                      ui-duration-200
                      peer-checked:hocus:ui-shadow
                      ui-border-primary-border
                      ui-border
                      ui-rounded-5
                      peer-checked:before:ui-translate-x-6
                      before:ui-content-['']
                      before:ui-absolute
                      before:ui-top-[2px]
                      before:ui-left-[2px]
                      before:ui-h-[18px]
                      before:ui-w-[18px]
                      before:ui-bg-primary-border
                      before:ui-rounded-full
                      before:ui-duration-200
                  `,
            {
                [ThemeColors.GREEN]: "peer-hocus:before:ui-bg-green peer-checked:before:ui-bg-green peer-hocus:ui-border-green peer-checked:ui-border-green peer-checked:ui-bg-green-bg peer-checked:hocus:ui-shadow-green/60",
                [ThemeColors.PURPLE]: "peer-hocus:before:ui-bg-purple peer-checked:before:ui-bg-purple peer-hocus:ui-border-purple peer-checked:ui-border-purple peer-checked:ui-bg-purple-bg peer-checked:hocus:ui-shadow-purple/60",
            }[colorScheme]
        )}
      />
    </label>
  );
}
