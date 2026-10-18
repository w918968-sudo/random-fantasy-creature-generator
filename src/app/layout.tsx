import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { GoogleAnalytics } from "@/components/google-analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Server-side build-time value; empty by default so the tag is omitted until a
// real Search Console verification code is provided (TODO(VERIFY)).
const gscVerification = process.env.GSC_VERIFICATION;

const HOME_TITLE = `${SITE_NAME} – Create Teams & Find Shiny Pokémon`;

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
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  ...(gscVerification ? { verification: { google: gscVerification } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-white/70 py-6 text-center text-sm text-slate-500">
          <nav aria-label="Footer" className="flex justify-center gap-6">
            <a href="/about" className="hover:text-slate-700">About</a>
            <a href="/privacy" className="hover:text-slate-700">Privacy</a>
            <a href="/credits" className="hover:text-slate-700">Credits &amp; Data Sources</a>
          </nav>
          <p className="mt-3 px-4 text-xs text-slate-400">
            {SITE_NAME} is a fan-made tool and is not affiliated with or endorsed
            by Nintendo, Game Freak, or The Pokémon Company.
          </p>
        </footer>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
