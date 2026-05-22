"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type State } from "@wagmi/core";
import { PropsWithChildren, useState } from "react";
import { WagmiProvider } from "wagmi";

import { config } from "@/config/wagmi/config";

import NuqsProvider from "./providers/NuqsAdapter";

export default function Providers({
  initialState,
  children,
}: PropsWithChildren<{ initialState: State | undefined }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <NuqsProvider>{children}</NuqsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
