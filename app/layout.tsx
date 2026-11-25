import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Footer, Header } from "@/components/ui"
import { PlayerProvider } from "@/components/player"
import { SITE_NAME, SITE_URL } from "@/lib/site"

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

const DESC = "TuneStation is a free online music player. Stream and download trending Hindi, Punjabi, English and regional songs in 320kbps – no login, no app needed."

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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TuneStation – free online music player" }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicons/apple-touch-icon.png",
    shortcut: "/favicons/favicon.ico",
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
        <PlayerProvider>
          <Header />
          <main className="mx-auto max-w-screen-2xl px-4 pb-10 pt-4 md:px-6">{children}</main>
          <Footer />
        </PlayerProvider>

        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2772537567714474"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script id="admiral" strategy="lazyOnload">{`!(function(o,_name){o[_name]=o[_name]||function $(){($.q=$.q||[]).push(arguments)},o[_name].v=o[_name].v||2;!(function(o,t,n,f,e,i){function c(f,e){(f=(function(t,n){try{if(n=(t=o.localStorage).getItem("_aQS01QjJBQkNCQkY5Q0NBRTA2NjhDRkYwRkItMg"))return JSON.parse(n).lgk||[];if((t.getItem("v4ac1eiZr0")||"").split(",")[4]>0)return[[_name+"-engaged","true"]]}catch(f){}})())&&typeof f.forEach===n&&(e=o[t].pubads())&&f.forEach((function(o){o&&o[0]&&e.setTargeting(o[0],o[1]||"")}))}(i=o[t]=o[t]||{}).cmd=i.cmd||[],typeof i.pubads===n?c():typeof i.cmd.unshift===n?i.cmd.unshift(c):i.cmd.push(c)})(window,"googletag","function");})(window,decodeURI('adm%69r%61l'));!(function(t,c,i){i=t.createElement(c),t=t.getElementsByTagName(c)[0],i.async=1,i.src="https://combcompetition.com/2036703e4c05/32e81a283edeaba8c48863d6.main.js",t.parentNode.insertBefore(i,t)})(document,"script");`}</Script>
      </body>
    </html>
  )
}
