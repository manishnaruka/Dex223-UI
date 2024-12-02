import clsx from "clsx";
import { AnchorHTMLAttributes } from "react";

import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  text: string;
  href: string;
  arrowSize?: number;
  color?: "green" | "white";
}

export default function ExternalTextLink({
  text,
  href,
  color = "green",
  className,
  arrowSize = 24,
  ...props
}: Props) {
  return (
    <a
      {...props}
      target="_blank"
      href={href}
      className={clsxMerge(
        "flex items-center duration-200",
        color === "green" ? "text-green hocus:text-green-hover" : "text-white hocus:text-green",
        className,
      )}
    >
      {text}
      <Svg iconName="forward" size={arrowSize} />
    </a>
  );
}
