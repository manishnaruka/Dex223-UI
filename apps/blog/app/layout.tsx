import "../assets/styles/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import clsx from "clsx";
import { Golos_Text } from "next/font/google";
import { PropsWithChildren } from "react";

import Providers from "@/app/providers";

const isProd = process.env.NODE_ENV === "production";

const golos_text = Golos_Text({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

interface Props {
  params: Promise<{
    locale: "es" | "en" | "zh";
  }>;
}

export default async function RootLayout({ children, params }: PropsWithChildren<Props>) {
  const locale = (await params).locale;
  return (
    <html suppressHydrationWarning lang={locale}>
      <body className={clsx(golos_text.className)}>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-E9D88G4XGB" />
    </html>
  );
}

export const metadata = {
  title: "Dex Exchange",
  description:
    "Next generation decentralized exchange for ERC-223 & ERC-20 tokens with margin trading, 15% cheaper GAS fees and transparent auto-listings for any tokens.",
};
