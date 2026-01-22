import "simplebar-react/dist/simplebar.min.css";

import { ComponentProps, HTMLAttributes } from "react";
import SimpleBar from "simplebar-react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  height: number | "full";
  scrollableNodeProps?: { [p: string]: any; ref?: any; className?: string | undefined } | undefined;
}
type SimpleBarChildren = ComponentProps<typeof SimpleBar>["children"];

export default function ScrollbarContainer({
  children,
  height,
  scrollableNodeProps,
  ...props
}: Props & { children?: SimpleBarChildren }) {
  return (
    <SimpleBar
      scrollableNodeProps={scrollableNodeProps}
      className={props.className}
      autoHide={false}
      style={
        height === "full"
          ? {
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }
          : { maxHeight: `${height}px` }
      }
    >
      {children}
    </SimpleBar>
  );
}
