import React from "react";

import Svg from "@/components/atoms/Svg";

export function YoutubeTag() {
  return (
    <span className="absolute bottom-5 left-5 bg-black/70 rounded-2 text-secondary-text px-3 py-2 z-10 flex items-center gap-2">
      <Svg iconName="youtube" />
      Video
    </span>
  );
}

export function CategoryTag({ tag }: { tag: string }) {
  return (
    <span className="absolute top-5 left-5 rounded-2 text-secondary-text px-3 py-2 z-10 flex items-center gap-2 bg-secondary-bg border border-secondary-bg">
      {tag}
    </span>
  );
}
