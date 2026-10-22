import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { CREATURES } from "@/lib/data/creatures";
import { GoogleAnalytics } from "@/components/google-analytics";
import { JsonLd } from "@/components/json-ld";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Sparkles } from "@/components/sparkles";
import { THEME_STORAGE_KEY } from "@/lib/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Server-side build-time value; empty by default so the tag is omitted until a
// real Search Console verification code is provided. The site is verified via
// the domain (DNS TXT) method, so this stays empty.
const gscVerification = process.env.GSC_VERIFICATION;

// Runs before paint so the saved background theme shows without a flash.
const THEME_INIT = `(function () {
  try {
    var t = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) {}
})();`;

const HOME_TITLE = `${SITE_NAME} — Original Creatures, One Roll at a Time`;

// Representative sample artwork for the social share card (no dedicated hero
// image exists yet; the first published creature stands in as a preview).
const HOME_OG_IMAGE = CREATURES[0]?.image
  ? {
      url: `${SITE_URL}${CREATURES[0].image}`,
      width: 1024,
      height: 1280,
      alt: CREATURES[0].alt,
    }
  : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: HOME_OG_IMAGE ? [HOME_OG_IMAGE] : undefined,
  },
  twitter: {
    card: HOME_OG_IMAGE ? "summary_large_image" : "summary",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: HOME_OG_IMAGE ? [HOME_OG_IMAGE.url] : undefined,
  },
  robots: { index: true, follow: true },
  ...(gscVerification ? { verification: { google: gscVerification } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT }}
        />
        <div className="flex-1">{children}</div>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
          }}
        />
        <footer className="border-t border-stone-200/70 bg-white/50 py-6 text-center text-sm text-stone-500 backdrop-blur-sm">
          <nav aria-label="Footer" className="flex justify-center gap-6">
            <a href="/creatures" className="font-semibold text-stone-700 hover:text-stone-900">Creatures</a>
            <a href="/favorites" className="font-semibold text-stone-700 hover:text-stone-900">Favorites</a>
            <a href="/about" className="font-semibold text-stone-700 hover:text-stone-900">About</a>
            <a href="/privacy" className="font-semibold text-stone-700 hover:text-stone-900">Privacy</a>
            <a href="/credits" className="font-semibold text-stone-700 hover:text-stone-900">Credits</a>
          </nav>
          <p className="mt-3 px-4 text-xs text-stone-500">
            {SITE_NAME} — every creature is original content ✦
          </p>
        </footer>
        <GoogleAnalytics />
        <Sparkles />
        <ThemeSwitcher />
      </body>
    </html>
  );
}
