import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "es", "zh"],

  // Used when no locale matches
  defaultLocale: "en",
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Static files
     */
    "/((?!api|_next|favicon.ico|images|robots.txt|sitemap.xml|static).*)",
  ],
};
