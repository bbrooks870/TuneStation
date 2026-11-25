import { ModulesView } from "@/components/modules-view"
import { JsonLd, LangChips, SearchBox } from "@/components/ui"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"


const FAQ = [
  {
    q: "Is TuneStation free?",
    a: "Yes. TuneStation is completely free – no sign-up, no subscription and no app to install. Open the site and press play.",
  },
  {
    q: "Can I download songs from TuneStation?",
    a: "Yes. Every song page has a Download button that saves the track in high quality (320kbps, .m4a), and you can also download from the player bar while listening.",
  },
  {
    q: "Which languages are available?",
    a: "Hindi, Punjabi, English, Haryanvi, Bhojpuri, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada and Malayalam – with trending songs, new albums and top charts for each.",
  },
  {
    q: "Does the music keep playing while I browse?",
    a: "Yes. The player stays at the bottom of the screen, so you can search and open other songs, albums and artists without stopping your music.",
  },
]

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: `${SITE_URL}/`,
              name: "TuneStation",
              alternateName: ["Tune Station", "TuneStation Music", "GDL Music Station"],
              inLanguage: "en-IN",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "WebApplication",
              name: "TuneStation",
              url: `${SITE_URL}/`,
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any (web browser)",
              image: `${SITE_URL}/og-image.png`,
              offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />

      <section className="relative isolate -mx-4 overflow-hidden px-4 pb-8 pt-8 md:mx-0 md:rounded-3xl md:px-10 md:pb-12 md:pt-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_10%_0%,rgba(255,79,139,.35),transparent),radial-gradient(50%_70%_at_90%_10%,rgba(124,58,237,.35),transparent)]" />
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
          TuneStation – free online music player
        </h1>
        <p className="mt-3 max-w-2xl text-white/70 md:text-lg">
          Stream and download trending Hindi, Punjabi and English songs in 320kbps. No login, no app – just search and press play.
        </p>
        <div className="mt-6 max-w-2xl">
          <SearchBox big />
        </div>
        <div className="mt-5">
          <LangChips />
        </div>
      </section>

      <ModulesView lang="hindi" />

      <section className="mt-16 grid gap-8 rounded-3xl bg-white/[.03] p-6 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="text-xl font-bold text-white md:text-2xl">Listen to music online, free</h2>
          <p className="mt-3 leading-relaxed text-white/65">
            TuneStation brings the latest Bollywood hits, Punjabi chartbusters, English pop and regional music to one simple, ad-light player.
            Search any song, artist or album, play it instantly and keep browsing while it plays. Every song can be downloaded in high
            quality, so your favourites are ready offline.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white md:text-2xl">FAQ</h2>
          <dl className="mt-3 space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-white">{f.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/65">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
