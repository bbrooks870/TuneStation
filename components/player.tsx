"use client"

import Link from "next/link"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { Track } from "@/lib/types"
import { fmtTime } from "@/lib/site"
import { DownloadIcon, HeartIcon, MuteIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, SpinnerIcon, VolumeIcon } from "./icons"
import { useFavorites } from "./favorites-context"

const API = "/api/saavn"

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

type Ctx = {
  current: Track | null
  playing: boolean
  loading: boolean
  play: (queue: Track[], index: number) => void
  toggle: () => void
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
  const current = queue[index] ?? null
  const { isFav, toggleFav } = useFavorites()
  const fav = current ? isFav(current.id) : false

  const load = useCallback(async (q: Track[], i: number) => {
    const t = q[i]
    const el = audio.current
    if (!t || !el) return
    setLoading(true)
    const src = await resolveSrc(t)
    setLoading(false)
    if (!src) return
    el.src = src
    el.play().catch(() => setPlaying(false))
    ;(window as any).gtag?.("event", "song_play", { song_id: t.id, song_name: t.name })
  }, [])

  const play = useCallback(
    (q: Track[], i: number) => {
      const same = queue[index]?.id === q[i]?.id
      if (same && audio.current?.src) {
        audio.current.paused ? audio.current.play() : audio.current.pause()
        return
      }
      setQueue(q)
      setIndex(i)
      setTime(0)
      setDur(q[i]?.duration ?? 0)
      load(q, i)
    },
    [queue, index, load],
  )

  const go = useCallback(
    (d: number) => {
      const i = index + d
      if (i < 0 || i >= queue.length) return
      setIndex(i)
      setTime(0)
      setDur(queue[i]?.duration ?? 0)
      load(queue, i)
    },
    [index, queue, load],
  )

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el || !current) return
    el.paused ? el.play() : el.pause()
  }, [current])

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
  }, [current, go])

  useEffect(() => {
    if (audio.current) audio.current.volume = volume
  }, [volume])

  const pct = dur ? (time / dur) * 100 : 0

  return (
    <PlayerCtx.Provider value={{ current, playing, loading, play, toggle }}>
      {children}
      <audio
        ref={audio}
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => (index < queue.length - 1 ? go(1) : setPlaying(false))}
      />
      {current && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-night-900/95 backdrop-blur supports-[backdrop-filter]:bg-night-900/80">
          {/* thin progress on mobile */}
          <div className="h-0.5 bg-white/10 md:hidden">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center gap-3 px-3 md:h-20 md:px-5">
            <Link href={current.href} className="flex min-w-0 flex-1 items-center gap-3 md:w-[30%] md:flex-none">
              <img src={current.thumb || current.image} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{current.name}</span>
                <span className="block truncate text-xs text-white/60">{current.artists}</span>
              </span>
            </Link>

            <div className="flex flex-col items-center gap-1 md:flex-1">
              <div className="flex items-center gap-2 md:gap-4">
                <button onClick={() => go(-1)} disabled={index <= 0} aria-label="Previous song" className="hidden p-2 text-white/80 hover:text-white disabled:opacity-30 sm:block">
                  <PrevIcon />
                </button>
                <button
                  onClick={toggle}
                  aria-label={playing ? "Pause" : "Play"}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-night-900 transition hover:scale-105"
                >
                  {loading ? <SpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={() => go(1)} disabled={index >= queue.length - 1} aria-label="Next song" className="p-2 text-white/80 hover:text-white disabled:opacity-30">
                  <NextIcon />
                </button>
              </div>
              <div className="hidden w-full max-w-xl items-center gap-2 text-[11px] tabular-nums text-white/60 md:flex">
                <span className="w-9 text-right">{fmtTime(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={dur || 0}
                  step={1}
                  value={time}
                  onChange={(e) => {
                    if (audio.current) audio.current.currentTime = Number(e.target.value)
                  }}
                  aria-label="Seek"
                  className="range flex-1"
                  style={{ ["--p" as any]: `${pct}%` }}
                />
                <span className="w-9">{fmtTime(dur)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 md:w-[30%]">
              <button
                onClick={() => current && toggleFav(current)}
                aria-label={fav ? "Remove from Favorites" : "Add to Favorites"}
                title={fav ? "In Favorites" : "Add to Favorites"}
                className={`p-2 transition hover:bg-white/10 rounded-full ${fav ? "text-accent" : "text-white/60 hover:text-white"}`}
              >
                <HeartIcon filled={fav} className="h-5 w-5" />
              </button>
              <button
                onClick={async () => {
                  setDl(true)
                  try {
                    await downloadTrack(current)
                  } finally {
                    setDl(false)
                  }
                }}
                aria-label={`Download ${current.name}`}
                title="Download"
                className="p-2 text-white/80 hover:text-white"
              >
                {dl ? <SpinnerIcon /> : <DownloadIcon />}
              </button>
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
                className="range hidden w-24 md:block"
                style={{ ["--p" as any]: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </PlayerCtx.Provider>
  )
}
