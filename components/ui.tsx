import Link from "next/link"
import type { Card } from "@/lib/types"
import { LANGS, MOODS, artistPath, moodPath } from "@/lib/site"
import { PlayIcon, SearchIcon } from "./icons"

const CDN_LOGO = "https://cdn.jsdelivr.net/gh/bbrooks870/TuneStation@master/public/logo.png"

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="TuneStation home">
      <img src={CDN_LOGO} alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
      <span className="hidden text-lg font-bold tracking-tight text-white sm:inline">
        Tune<span className="text-accent">Station</span>
      </span>
    </Link>
  )
}

export function SearchBox({ defaultValue = "", autoFocus = false, big = false }: { defaultValue?: string; autoFocus?: boolean; big?: boolean }) {
  return (
    <form action="/search" role="search" className="relative w-full">
      <SearchIcon className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50 ${big ? "h-5 w-5" : "h-4 w-4"}`} />
      <input
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search songs, artists, albums…"
        aria-label="Search songs, artists, albums"
        className={`w-full rounded-full border border-white/10 bg-white/[.07] text-white placeholder:text-white/45 outline-none transition focus:border-accent/60 focus:bg-white/10 ${big ? "h-14 pl-12 pr-5 text-base" : "h-10 pl-10 pr-4 text-sm"}`}
      />
    </form>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-night-900/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4 md:px-6">
        <Logo />
        <div className="flex-1 md:max-w-md">
          <SearchBox />
        </div>
        <nav className="ml-auto flex items-center gap-3 text-sm text-white/70 md:gap-5" aria-label="Main">
          <Link
            href="/favorites"
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white md:text-sm"
          >
            <span className="text-accent" aria-hidden="true">♥</span>
            <span className="sr-only sm:not-sr-only">Favorites</span>
          </Link>
          <Link href="/mood" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden">
            Moods
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/mood" className="hover:text-white">Moods</Link>
            <Link href="/songs/hindi" className="hover:text-white">Hindi</Link>
            <Link href="/songs/punjabi" className="hover:text-white">Punjabi</Link>
            <Link href="/songs/english" className="hover:text-white">English</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export function LangChips({ active }: { active?: string }) {
  return (
    <nav aria-label="Languages" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {LANGS.map((l) => (
        <Link
          key={l.key}
          href={`/songs/${l.key}`}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${
            active === l.key ? "bg-white text-night-900" : "bg-white/[.07] text-white/80 hover:bg-white/15 hover:text-white"
          }`}
        >
          {l.name}
        </Link>
      ))}
    </nav>
  )
}

export function Section({ title, href, children, as: H = "h2" }: { title: string; href?: string; children: React.ReactNode; as?: "h2" | "h3" }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <H className="text-xl font-bold tracking-tight text-white md:text-2xl">{title}</H>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-medium text-white/60 hover:text-white">
            See all
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export function Shelf({ items }: { items: Card[] }) {
  if (!items.length) return null
  return (
    <div className="no-scrollbar -mx-4 grid snap-x auto-cols-[44%] grid-flow-col gap-4 overflow-x-auto px-4 pb-2 sm:auto-cols-[30%] md:mx-0 md:auto-cols-[22%] md:px-0 lg:auto-cols-[17%] xl:auto-cols-[14.5%]">
      {items.map((c) => (
        <CardTile key={`${c.kind}-${c.id}`} c={c} />
      ))}
    </div>
  )
}

export function Grid({ items }: { items: Card[] }) {
  if (!items.length) return null
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((c) => (
        <CardTile key={`${c.kind}-${c.id}`} c={c} />
      ))}
    </div>
  )
}

function CardTile({ c }: { c: Card }) {
  const round = c.kind === "artist"
  return (
    <Link href={c.href} className="group snap-start rounded-xl p-2 transition hover:bg-white/[.06]">
      <div className={`relative aspect-square overflow-hidden bg-white/5 ${round ? "rounded-full" : "rounded-lg"}`}>
        {c.image && <img src={c.image} alt={c.name} width={300} height={300} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />}
        {!round && (
          <span className="absolute bottom-2 right-2 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-accent text-night-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
            <PlayIcon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className={`mt-2 line-clamp-1 text-sm font-semibold text-white ${round ? "text-center" : ""}`}>{c.name}</p>
      {c.subtitle && <p className={`line-clamp-1 text-xs text-white/55 ${round ? "text-center" : ""}`}>{c.subtitle}</p>}
    </Link>
  )
}

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-xs text-white/50">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">›</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-white">
                {it.name}
              </Link>
            ) : (
              <span className="line-clamp-1 text-white/70">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Big cover + title block used on song/album/playlist/artist pages. */
export function Hero({
  image,
  kicker,
  title,
  round = false,
  children,
}: {
  image: string
  kicker: string
  title: string
  round?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="relative isolate -mx-4 overflow-hidden px-4 pb-6 pt-2 md:mx-0 md:rounded-3xl md:p-8">
      {image && <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-30 blur-3xl" />}
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
        {image ? (
          <img
            src={image}
            alt={title}
            width={240}
            height={240}
            className={`h-52 w-52 shrink-0 object-cover shadow-2xl shadow-black/50 md:h-60 md:w-60 ${round ? "rounded-full" : "rounded-xl"}`}
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{kicker}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 pb-28">
      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 text-sm text-white/55 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm">Free online music player. Stream and download Hindi, Punjabi, English and regional songs in 320kbps — no login, no app.</p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">Songs by language</p>
          <ul className="grid grid-cols-2 gap-1.5">
            {LANGS.map((l) => (
              <li key={l.key}>
                <Link href={`/songs/${l.key}`} className="hover:text-white">
                  {l.name} songs
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">Music by mood</p>
          <ul className="grid grid-cols-2 gap-1.5">
            {MOODS.map((m) => (
              <li key={m.key}>
                <Link href={moodPath(m.key)} className="hover:text-white">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">TuneStation</p>
          <ul className="space-y-1.5">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of use</Link></li>
            <li><Link href="/search" className="hover:text-white">Search</Link></li>
          </ul>
        </div>
      </div>
      <p className="px-4 text-center text-xs text-white/35">All songs, artwork and trademarks belong to their respective owners and labels. Music data via JioSaavn.</p>
    </footer>
  )
}

export function ArtistLinks({ list }: { list: { id: string; name: string }[] }) {
  return (
    <>
      {list.map((a, i) => (
        <span key={`${a.id}-${i}`}>
          {i > 0 && ", "}
          {a.id ? (
            <Link href={artistPath(a.name, a.id)} className="font-medium text-white hover:underline">
              {a.name}
            </Link>
          ) : (
            a.name
          )}
        </span>
      ))}
    </>
  )
}

/** Colourful mood/activity tiles (Meditation, Sleep, Workout…). */
export function MoodGrid({ active, scroll = false }: { active?: string; scroll?: boolean }) {
  return (
    <div
      className={`grid gap-3 lg:grid-cols-7 ${
        scroll
          ? "no-scrollbar -mx-4 auto-cols-[42%] grid-flow-col grid-rows-2 overflow-x-auto px-4 sm:auto-cols-[30%] md:mx-0 md:grid-flow-row md:grid-cols-4 md:grid-rows-none md:px-0"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      }`}
    >
      {MOODS.map((m) => (
        <Link
          key={m.key}
          href={moodPath(m.key)}
          aria-current={active === m.key ? "page" : undefined}
          className={`flex h-20 items-center gap-3 rounded-2xl bg-gradient-to-br ${m.tint} to-white/[.04] px-4 font-semibold text-white ring-1 transition hover:scale-[1.02] hover:ring-white/30 ${
            active === m.key ? "ring-white/60" : "ring-white/10"
          }`}
        >
          <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
          <span className="leading-tight">{m.name}</span>
        </Link>
      ))}
    </div>
  )
}
