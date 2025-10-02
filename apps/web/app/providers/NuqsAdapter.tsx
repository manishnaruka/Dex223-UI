"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PropsWithChildren } from "react";

export default function NuqsProvider({ children }: PropsWithChildren) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
