import clsx from "clsx";

export enum BadgeVariant {
  COLORED,
  DEFAULT,
  PERCENTAGE,
}

type Props =
  | {
      variant?: BadgeVariant.COLORED;
      color?: "blue" | "red" | "green" | "purple" | "grey";
      size?: "default" | "small";
      text: string;
    }
  | {
      variant: BadgeVariant.PERCENTAGE;
      percentage: number | string;
    }
  | {
      variant: BadgeVariant.DEFAULT;
      size?: "default" | "small";
      text: string;
    };
export default function Badge(props: Props) {
  switch (props.variant) {
    case BadgeVariant.COLORED:
    case undefined: {
      const { text, color = "green", size = "default" } = props;
      return (
        <div
          className={clsx(
            "rounded-5 px-2 font-medium box-border text-nowrap",
            color === "blue" && "bg-blue-bg shadow-[0_0_0_1px_theme(colors.blue)_inset] text-blue",
            color === "green" &&
              "bg-green-bg shadow-[0_0_0_1px_theme(colors.green)_inset] text-green",
            color === "purple" &&
              "bg-purple-bg shadow-[0_0_0_1px_theme(colors.purple)_inset] text-purple",
            color === "red" && "bg-red-bg shadow-[0_0_0_1px_theme(colors.red)_inset] text-red",
            color === "grey" &&
              "bg-quaternary-bg text-secondary-text shadow-[0_0_0_1px_theme(colors.quaternary-bg)_inset]",

            size === "default" ? "text-12 py-px " : "text-10",
          )}
        >
          {text}
        </div>
      );
    }
    case BadgeVariant.DEFAULT: {
      const { text: defaultText, size = "default" } = props;
      return (
        <div
          className={clsx(
            "bg-tertiary-bg text-secondary-text px-2 rounded-20 font-medium",
            size === "small" && "text-14",
          )}
        >
          {defaultText}
        </div>
      );
    }
    case BadgeVariant.PERCENTAGE:
      const { percentage } = props;
      return (
        <div
          className={clsx(
            "border border-secondary-text text-secondary-text px-2 lg:px-3 rounded-5 h-5 lg:h-6 flex items-center justify-center text-12 lg:text-16",
          )}
        >
          {typeof percentage === "number" ? `${percentage}% select` : percentage}
        </div>
      );
  }
}
