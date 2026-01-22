import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { PropsWithChildren } from "react";

import { Providers } from "@/app/[locale]/providers";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { routing, type Locale } from "@/i18n/routing"
interface Props {
  params: Promise<{
    locale: string;
  }>;
}
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function RootLayout({ children, params }: PropsWithChildren<Props>) {
  const locale = (await params).locale;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const safeLocale = locale as Locale;
  setRequestLocale(safeLocale);
  // Providing all messages to the client
  // side is the easiest way to get started
  // const messages = await getMessages();
  const messages = (await import(`../../messages/${safeLocale}.json`)).default;

  return (
    <>
      <Providers messages={messages} locale={safeLocale}>
        <div className="grid h-[100svh] grid-rows-layout">
          <Header />
          <div className="pb-4 lg:pb-[80px]">
            <NuqsAdapter>{children}</NuqsAdapter>
          </div>
          <Footer />
        </div>
      </Providers>
    </>
  );
}
