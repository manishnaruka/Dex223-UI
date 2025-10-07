import { Metadata } from "next";
import { redirect } from "next/navigation";
import React, { PropsWithChildren } from "react";

import { isMarginModuleEnabled } from "@/config/modules";

export const metadata: Metadata = {
  title: "Swap",
};

export default function Layout({ children }: PropsWithChildren) {
  return isMarginModuleEnabled ? <>{children}</> : redirect("/en/swap");
}
