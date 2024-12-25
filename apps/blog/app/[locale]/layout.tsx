import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { PropsWithChildren } from "react";

import { Providers } from "@/app/[locale]/providers";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { Locale, routing } from "@/i18n/routing";
interface Props {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function RootLayout({ children, params }: PropsWithChildren<Props>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  setRequestLocale(locale);

  return (
    <>
      <Providers messages={messages} locale={locale}>
        <div className="grid h-[100svh] grid-rows-layout">
          <Header />
          <div>{children}</div>
          <Footer />
        </div>
      </Providers>
    </>
  );
}
