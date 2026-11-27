"use client"

import Link from "next/link"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { Track } from "@/lib/types"
import { toTrack } from "@/lib/api"
import { fmtTime } from "@/lib/site"
import {
  ChevronDownIcon,
  DownloadIcon,
  HeartIcon,
  MoonIcon,
  MuteIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
  SpinnerIcon,
  VolumeIcon,
} from "./icons"
import { useFavorites } from "./favorites-context"

const API = "/api/saavn"
const RECENT_KEY = "tunestation_recent_v1"

/** Fetch the 320kbps stream URL for tracks that came from listings without one. */
async function resolveSrc(t: Track): Promise<string | null> {
  if (t.src) return t.src
  try {
    const r = await fetch(`${API}/songs/${encodeURIComponent(t.id)}`)
    const d = (await r.json())?.data?.[0]
    const dl: any[] = d?.downloadUrl ?? []
    const best = dl.find((x) => x.quality === "320kbps") ?? dl[dl.length - 1]
    const audioUrl = best?.url ?? best?.link ?? null
    return audioUrl ? String(audioUrl).replace(/^http:/, "https:") : null
  } catch {
    return null
  }
}

/** Autoplay: more songs by the current track's first artist. ponytail: API's /suggestions is broken, artist search is the stand-in. */
async function similar(t: Track): Promise<Track[]> {
  const artist = t.artists.split(",")[0].trim()
  if (!artist) return []
  try {
    const r = await fetch(`${API}/search/songs?query=${encodeURIComponent(artist)}&limit=20`)
    return (((await r.json())?.data?.results ?? []) as any[]).map(toTrack)
  } catch {
    return []
  }
}

export async function downloadTrack(t: Track) {
  const src = await resolveSrc(t)
  if (!src) throw new Error("no source")
  const blob = await (await fetch(src)).blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${t.name} - ${t.artists.split(",")[0].trim()}.m4a`.replace(/[\\/:*?"<>|]/g, "")
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  ;(window as any).gtag?.("event", "song_download", { song_id: t.id, song_name: t.name })
}

type Repeat = "off" | "all" | "one"
/** minutes, or "end" = stop after the current song */
type Sleep = number | "end" | null

type Ctx = {
  current: Track | null
  playing: boolean
  loading: boolean
  play: (queue: Track[], index: number) => void
  toggle: () => void
  recent: Track[]
  sleepEnd: number | "end" | null
  setSleep: (s: Sleep) => void
}
const PlayerCtx = createContext<Ctx | null>(null)
export const usePlayer = () => useContext(PlayerCtx)!

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [dl, setDl] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<Repeat>("off")
  const [sleepEnd, setSleepEnd] = useState<number | "end" | null>(null)
  const [recent, setRecent] = useState<Track[]>([])
  const [open, setOpen] = useState(false) // full-screen player (mobile)
  const current = queue[index] ?? null
  const { isFav, toggleFav } = useFavorites()
  const fav = current ? isFav(current.id) : false

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
      if (Array.isArray(r)) setRecent(r)
    } catch {}
  }, [])

  const remember = useCallback((t: Track) => {
    setRecent((prev) => {
      const next = [{ ...t, src: undefined }, ...prev.filter((x) => x.id !== t.id)].slice(0, 30)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const load = useCallback(
    async (q: Track[], i: number) => {
      const t = q[i]
      const el = audio.current
      if (!t || !el) return
      setLoading(true)
      const src = await resolveSrc(t)
      setLoading(false)
      if (!src) return
      el.src = src
      el.play().catch(() => setPlaying(false))
      remember(t)
      ;(window as any).gtag?.("event", "song_play", { song_id: t.id, song_name: t.name })
    },
    [remember],
  )

  const jump = useCallback(
    (q: Track[], i: number) => {
      setQueue(q)
      setIndex(i)
      setTime(0)
      setDur(q[i]?.duration ?? 0)
      load(q, i)
    },
    [load],
  )

  const play = useCallback(
    (q: Track[], i: number) => {
      if (queue[index]?.id === q[i]?.id && audio.current?.src) {
        audio.current.paused ? audio.current.play() : audio.current.pause()
        return
      }
      jump(q, i)
    },
    [queue, index, jump],
  )

  const go = useCallback(
    async (d: number) => {
      // ponytail: shuffle = random pick per skip, no shuffled-order history; "previous" just steps back in the list.
      if (d > 0 && shuffle && queue.length > 1) {
        let i = index
        while (i === index) i = Math.floor(Math.random() * queue.length)
        return jump(queue, i)
      }
      const i = index + d
      if (i >= 0 && i < queue.length) return jump(queue, i)
      if (d < 0) return
      if (repeat === "all") return jump(queue, 0)
      // end of queue → autoplay similar songs
      if (!current) return
      setLoading(true)
      const have = new Set(queue.map((t) => t.id))
      const more = (await similar(current)).filter((t) => !have.has(t.id))
      setLoading(false)
      if (more.length) jump([...queue, ...more], queue.length)
      else setPlaying(false)
    },
    [index, queue, shuffle, repeat, current, jump],
  )

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el || !current) return
    el.paused ? el.play() : el.pause()
  }, [current])

  const onEnded = () => {
    if (sleepEnd === "end") {
      setSleepEnd(null)
      return setPlaying(false)
    }
    if (repeat === "one" && audio.current) {
      audio.current.currentTime = 0
      audio.current.play()
      return
    }
    go(1)
  }

  // Sleep timer (minutes): fade out over the last 10s, then pause.
  const setSleep = useCallback((s: Sleep) => setSleepEnd(typeof s === "number" ? Date.now() + s * 60_000 : s), [])
  useEffect(() => {
    if (typeof sleepEnd !== "number") return
    const id = setInterval(() => {
      const el = audio.current
      const left = sleepEnd - Date.now()
      if (!el) return
      if (left <= 0) {
        el.pause()
        el.volume = volume
        setSleepEnd(null)
      } else if (left < 10_000) el.volume = volume * (left / 10_000)
    }, 500)
    return () => {
      clearInterval(id)
      if (audio.current) audio.current.volume = volume // undo a half-finished fade on cancel
    }
  }, [sleepEnd, volume])

  // Lock-screen / headphone controls
  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.name,
      artist: current.artists,
      album: current.album ?? "",
      artwork: [{ src: current.image, sizes: "500x500", type: "image/jpeg" }],
    })
    navigator.mediaSession.setActionHandler("previoustrack", () => go(-1))
    navigator.mediaSession.setActionHandler("nexttrack", () => go(1))
    navigator.mediaSession.setActionHandler("seekto", (e) => {
      if (audio.current && e.seekTime != null) audio.current.currentTime = e.seekTime
    })
  }, [current, go])

  // Keyboard: Space play/pause, ←/→ seek 10s, Shift+←/→ prev/next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = audio.current
      const tag = (e.target as HTMLElement)?.tagName
      if (!el || !current || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return
      if (e.code === "Space") {
        e.preventDefault()
        toggle()
      } else if (e.key === "ArrowRight") e.shiftKey ? go(1) : (el.currentTime += 10)
      else if (e.key === "ArrowLeft") e.shiftKey ? go(-1) : (el.currentTime -= 10)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, toggle, go])

  useEffect(() => {
    if (audio.current) audio.current.volume = volume
  }, [volume])

  const pct = dur ? (time / dur) * 100 : 0
  const seek = (v: number) => {
    if (audio.current) audio.current.currentTime = v
  }
  const cycleRepeat = () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))
  const repeatLabel = repeat === "off" ? "Repeat off" : repeat === "all" ? "Repeat all" : "Repeat one"

  const shuffleBtn = (big = false) => (
    <button onClick={() => setShuffle((s) => !s)} aria-pressed={shuffle} aria-label="Shuffle" title="Shuffle" className={`relative p-2 transition ${shuffle ? "text-accent" : "text-white/60 hover:text-white"}`}>
      <ShuffleIcon className={big ? "h-6 w-6" : "h-[18px] w-[18px]"} />
      {shuffle && <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
    </button>
  )
  const repeatBtn = (big = false) => (
    <button onClick={cycleRepeat} aria-label={repeatLabel} title={repeatLabel} className={`relative p-2 transition ${repeat !== "off" ? "text-accent" : "text-white/60 hover:text-white"}`}>
      <RepeatIcon className={big ? "h-6 w-6" : "h-[18px] w-[18px]"} />
      {repeat === "one" && <span className="absolute right-0.5 top-0.5 text-[9px] font-bold">1</span>}
      {repeat !== "off" && <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
    </button>
  )
  const playBtn = (big = false) => (
    <button
      onClick={toggle}
      aria-label={playing ? "Pause" : "Play"}
      className={`grid place-items-center rounded-full bg-white text-night-900 transition hover:scale-105 ${big ? "h-16 w-16" : "h-11 w-11"}`}
    >
      {loading ? <SpinnerIcon className={big ? "h-7 w-7" : "h-5 w-5"} /> : playing ? <PauseIcon className={big ? "h-7 w-7" : "h-5 w-5"} /> : <PlayIcon className={big ? "h-7 w-7" : "h-5 w-5"} />}
    </button>
  )
  const dlBtn = (big = false) =>
    current && (
      <button
        onClick={async () => {
          setDl(true)
          try {
            await downloadTrack(current)
          } catch {
          } finally {
            setDl(false)
          }
        }}
        aria-label={`Download ${current.name}`}
        title="Download"
        className="p-2 text-white/80 hover:text-white"
      >
        {dl ? <SpinnerIcon className={big ? "h-6 w-6" : "h-5 w-5"} /> : <DownloadIcon className={big ? "h-6 w-6" : "h-5 w-5"} />}
      </button>
    )
  const favBtn = (big = false) =>
    current && (
      <button
        onClick={() => toggleFav(current)}
        aria-label={fav ? "Remove from Favorites" : "Add to Favorites"}
        title={fav ? "In Favorites" : "Add to Favorites"}
        className={`rounded-full p-2 transition hover:bg-white/10 ${fav ? "text-accent" : "text-white/60 hover:text-white"}`}
      >
        <HeartIcon filled={fav} className={big ? "h-6 w-6" : "h-5 w-5"} />
      </button>
    )

  return (
    <PlayerCtx.Provider value={{ current, playing, loading, play, toggle, recent, sleepEnd, setSleep }}>
      {children}
      <audio
        ref={audio}
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={onEnded}
      />
      {current && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-night-900/95 backdrop-blur supports-[backdrop-filter]:bg-night-900/80">
          {/* mobile: thin progress with an invisible, finger-sized seek slider on top */}
          <div className="relative h-1 bg-white/10 md:hidden">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            <input type="range" min={0} max={dur || 0} step={1} value={time} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" className="absolute -top-2 left-0 h-5 w-full cursor-pointer opacity-0" />
          </div>
          <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center gap-3 px-3 md:h-20 md:px-5">
            {/* mobile: tap opens full-screen player; desktop: link to song page */}
            <button onClick={() => setOpen(true)} aria-label="Open player" className="flex min-w-0 flex-1 items-center gap-3 text-left md:hidden">
              <img src={current.thumb || current.image} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{current.name}</span>
                <span className="block truncate text-xs text-white/60">{current.artists}</span>
              </span>
            </button>
            <Link href={current.href} className="hidden min-w-0 items-center gap-3 md:flex md:w-[30%]">
              <img src={current.thumb || current.image} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{current.name}</span>
                <span className="block truncate text-xs text-white/60">{current.artists}</span>
              </span>
            </Link>

            <div className="flex flex-col items-center gap-1 md:flex-1">
              <div className="flex items-center gap-1 md:gap-3">
                <span className="hidden md:block">{shuffleBtn()}</span>
                <button onClick={() => go(-1)} disabled={index <= 0} aria-label="Previous song" className="hidden p-2 text-white/80 hover:text-white disabled:opacity-30 md:block">
                  <PrevIcon />
                </button>
                {playBtn()}
                <button onClick={() => go(1)} aria-label="Next song" className="p-2 text-white/80 hover:text-white">
                  <NextIcon />
                </button>
                <span className="hidden md:block">{repeatBtn()}</span>
              </div>
              <div className="hidden w-full max-w-xl items-center gap-2 text-[11px] tabular-nums text-white/60 md:flex">
                <span className="w-9 text-right">{fmtTime(time)}</span>
                <input type="range" min={0} max={dur || 0} step={1} value={time} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" className="range flex-1" style={{ ["--p" as any]: `${pct}%` }} />
                <span className="w-9">{fmtTime(dur)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 md:w-[30%]">
              {favBtn()}
              <span className="hidden md:block">{dlBtn()}</span>
              <span className="hidden md:block"><SleepTimer compact /></span>
              <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="hidden p-2 text-white/80 hover:text-white md:block">
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value))
                  setMuted(false)
                }}
                aria-label="Volume"
                className="range hidden w-24 lg:block"
                style={{ ["--p" as any]: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* full-screen player (mobile) */}
      {current && open && (
        <div role="dialog" aria-modal="true" aria-label="Now playing" className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-night-900 px-6 pb-8 pt-4 md:hidden">
          <img src={current.image} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-25 blur-3xl" />
          <div className="flex items-center justify-between">
            <button onClick={() => setOpen(false)} aria-label="Close player" className="-ml-2 p-2 text-white/80">
              <ChevronDownIcon className="h-7 w-7" />
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Now playing</p>
            <SleepTimer compact />
          </div>
          <img src={current.image} alt={current.name} width={500} height={500} className="mx-auto mt-6 aspect-square w-full max-w-sm rounded-2xl object-cover shadow-2xl shadow-black/60" />
          <div className="mt-8 flex items-start justify-between gap-3">
            <Link href={current.href} onClick={() => setOpen(false)} className="min-w-0">
              <span className="block truncate text-2xl font-bold text-white">{current.name}</span>
              <span className="block truncate text-white/60">{current.artists}</span>
            </Link>
            {favBtn(true)}
          </div>
          <div className="mt-6">
            <input type="range" min={0} max={dur || 0} step={1} value={time} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" className="range w-full" style={{ ["--p" as any]: `${pct}%` }} />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-white/50">
              <span>{fmtTime(time)}</span>
              <span>{fmtTime(dur)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            {shuffleBtn(true)}
            <button onClick={() => go(-1)} disabled={index <= 0} aria-label="Previous song" className="p-2 text-white disabled:opacity-30">
              <PrevIcon className="h-8 w-8" />
            </button>
            {playBtn(true)}
            <button onClick={() => go(1)} aria-label="Next song" className="p-2 text-white">
              <NextIcon className="h-8 w-8" />
            </button>
            {repeatBtn(true)}
          </div>
          <div className="mt-6 flex justify-center">
            {dlBtn(true)}
          </div>
          {queue.length > index + 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-white/70">Up next</p>
              <ol className="space-y-1">
                {queue.slice(index + 1, index + 6).map((t, k) => (
                  <li key={`${t.id}-${k}`}>
                    <button onClick={() => jump(queue, index + 1 + k)} className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-white/5">
                      <img src={t.thumb || t.image} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 rounded object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">{t.name}</span>
                        <span className="block truncate text-xs text-white/50">{t.artists}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </PlayerCtx.Provider>
  )
}

const SLEEP_OPTS: [string, string][] = [
  ["", "Off"],
  ["15", "15 minutes"],
  ["30", "30 minutes"],
  ["45", "45 minutes"],
  ["60", "1 hour"],
  ["90", "1.5 hours"],
  ["end", "End of song"],
]

/** Sleep timer: native <select> layered over a moon button – accessible and zero JS menus. */
export function SleepTimer({ compact = false }: { compact?: boolean }) {
  const { sleepEnd, setSleep } = usePlayer()
  const [, tick] = useState(0)
  useEffect(() => {
    if (typeof sleepEnd !== "number") return
    const id = setInterval(() => tick((n) => n + 1), 15_000)
    return () => clearInterval(id)
  }, [sleepEnd])
  const mins = typeof sleepEnd === "number" ? Math.max(1, Math.ceil((sleepEnd - Date.now()) / 60_000)) : 0
  const label = sleepEnd === "end" ? "End of song" : mins ? `${mins} min` : compact ? "" : "Sleep timer"
  return (
    <label className={`relative inline-flex cursor-pointer items-center gap-1.5 ${compact ? "p-2" : "h-12 rounded-full border border-white/25 px-5 font-semibold hover:border-white hover:bg-white/5"} ${sleepEnd ? "text-accent" : "text-white/80 hover:text-white"}`} title="Sleep timer">
      <MoonIcon className={compact ? "h-[18px] w-[18px]" : "h-5 w-5"} />
      {label && <span className={compact ? "text-[11px] tabular-nums" : ""}>{label}</span>}
      <select
        aria-label="Sleep timer"
        value={sleepEnd === "end" ? "end" : mins ? "on" : ""}
        onChange={(e) => {
          const v = e.target.value
          if (v !== "on") setSleep(v === "" ? null : v === "end" ? "end" : Number(v))
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {mins > 0 && <option value="on" hidden>{mins} min left</option>}
        {SLEEP_OPTS.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  )
}
