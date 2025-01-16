import clsx from "clsx";
import { HTMLAttributes, PropsWithChildren } from "react";

export enum CardGradient {
  GREEN_LIGHT,
  BLUE_LIGHT,
  RED_LIGHT,
  YELLOW_LIGHT,
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  gradient?: CardGradient;
}

const gradientBackgroundMap: Record<CardGradient, string> = {
  [CardGradient.BLUE_LIGHT]: "bg-gradient-card-blue-light-fill",
  [CardGradient.GREEN_LIGHT]: "bg-gradient-card-green-light-fill",
  [CardGradient.RED_LIGHT]: "bg-gradient-card-red-light-fill",
  [CardGradient.YELLOW_LIGHT]: "bg-gradient-card-yellow-light-fill",
};

const gradientBorderMap: Record<CardGradient, string> = {
  [CardGradient.BLUE_LIGHT]: "before:bg-gradient-card-blue-dark-border",
  [CardGradient.GREEN_LIGHT]: "before:bg-gradient-card-green-dark-border",
  [CardGradient.RED_LIGHT]: "before:bg-gradient-card-red-light-border",
  [CardGradient.YELLOW_LIGHT]: "before:bg-gradient-card-yellow-light-border",
};

export default function GradientCard({
  gradient = CardGradient.GREEN_LIGHT,
  children,
  className,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <div
      className={clsx(
        "relative before:w-[calc(100%_+_2px)] before:h-[calc(100%_+_2px)] before:-top-px before:-left-px before:rounded-3 before:absolute",
        gradientBorderMap[gradient],
      )}
    >
      <div
        className={clsx("relative rounded-3", gradientBackgroundMap[gradient], className)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
