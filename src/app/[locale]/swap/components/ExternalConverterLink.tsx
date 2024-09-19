import React from "react";
import { useMediaQuery } from "react-responsive";

import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";

export default function ExternalConverterLink() {
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  return (
    <a
      target="_blank"
      href="https://gorbatiukcom.github.io/token-converter/"
      className="flex items-center gap-1 pl-3 pr-3 md:pl-4 md:pr-5 justify-between rounded-2 bg-primary-bg border-l-4 border-l-green py-3 hover:bg-green-bg duration-200"
    >
      <div className="flex items-center gap-1 text-14 md:text-16">
        <Svg iconName="convert" className="text-green mr-1 flex-shrink-0" />
        Convert your <Badge size={isMobile ? "small" : undefined} text="ERC-20" /> tokens to{" "}
        <Badge size={isMobile ? "small" : undefined} text="ERC-223" />
      </div>
      <Svg className="text-primary-text" iconName="forward" />
    </a>
  );
}
