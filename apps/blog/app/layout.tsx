import "../assets/styles/globals.css";
import "@repo/ui/styles.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import clsx from "clsx";
import { Golos_Text } from "next/font/google";
import type { ReactNode } from "react";

import Providers from "@/app/providers";
import ClientOnly from "@/components/common/ClientOnly";
import SEOAgent from "@/components/common/SEOAgent";

const isProd = process.env.NODE_ENV === "production";

const golos_text = Golos_Text({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {isProd ? (
          <ClientOnly>
            <SEOAgent />
          </ClientOnly>
        ) : null}
      </head>

      <body className={clsx(golos_text.className)}>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-E9D88G4XGB" />
    </html>
  );
}

export const metadata = {
  title: "Dex223 Blog",
  description:
    "Explore in-depth insights, updates, and guides on Dex223 – your go-to source for decentralized exchange (DEX) development, token standards, and blockchain innovations. Stay ahead in the Web3 ecosystem!",
};
