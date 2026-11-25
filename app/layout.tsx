import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Footer, Header } from "@/components/ui"
import { PlayerProvider } from "@/components/player"
import { FavoritesProvider } from "@/components/favorites-context"
import { SITE_NAME, SITE_URL } from "@/lib/site"

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

const DESC = "TuneStation is a free online music player. Stream and download trending Hindi, Punjabi, English and regional songs in 320kbps – no login, no app needed."

const CDN_BASE = "https://cdn.jsdelivr.net/gh/bbrooks870/TuneStation@master/public"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "TuneStation – Free Online Music Player | Listen & Download Songs", template: "%s | TuneStation" },
  description: DESC,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: "TuneStation – Free Online Music Player",
    description: DESC,
    images: [{ url: `${CDN_BASE}/og-image.png`, width: 1200, height: 630, alt: "TuneStation – free online music player" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TuneStation – Free Online Music Player",
    description: DESC,
    images: [`${CDN_BASE}/og-image.png`],
  },
  icons: {
    icon: [
      { url: `${CDN_BASE}/favicons/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${CDN_BASE}/favicons/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
    ],
    apple: `${CDN_BASE}/favicons/apple-touch-icon.png`,
    shortcut: `${CDN_BASE}/favicons/favicon.ico`,
  },
  manifest: "/favicons/manifest.json",
  appleWebApp: { title: SITE_NAME, capable: true, statusBarStyle: "black" },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = { themeColor: "#0d0a1a", width: "device-width", initialScale: 1 }

// Old CRA hash URLs (/#/search, /#/about …) → real paths
const HASH_REDIRECT = `(function(){var h=location.hash;if(h.indexOf('#/')!==0)return;var p=h.slice(2).split('?')[0];location.replace(['search','about','terms'].indexOf(p)>-1?'/'+p:'/')})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8LFK6PK624"></script>
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8LFK6PK624');
            `,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: HASH_REDIRECT }} />
        <link rel="preconnect" href="https://c.saavncdn.com" />

      </head>
      <body className="min-h-screen font-sans">
        <FavoritesProvider>
          <PlayerProvider>
            <Header />
            <main className="mx-auto max-w-screen-2xl px-4 pb-10 pt-4 md:px-6">{children}</main>
            <Footer />
          </PlayerProvider>
        </FavoritesProvider>
      </body>
    </html>
  )
}
