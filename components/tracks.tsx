"use client"

import Link from "next/link"
import { useState } from "react"
import type { Track } from "@/lib/types"
import { fmtTime } from "@/lib/site"
import { downloadTrack, usePlayer } from "./player"
import { DownloadIcon, EqIcon, PauseIcon, PlayIcon, SpinnerIcon } from "./icons"

export function DownloadButton({ track, big = false }: { track: Track; big?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const run = async () => {
    setBusy(true)
    setErr(false)
    try {
      await downloadTrack(track)
    } catch {
      setErr(true)
    } finally {
      setBusy(false)
    }
  }
  if (big)
    return (
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 font-semibold text-white transition hover:border-white hover:bg-white/5 disabled:opacity-60"
      >
        {busy ? <SpinnerIcon /> : <DownloadIcon />}
        {busy ? "Downloading…" : err ? "Retry download" : "Download 320kbps"}
      </button>
    )
  return (
    <button onClick={run} disabled={busy} aria-label={`Download ${track.name}`} title="Download" className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
      {busy ? <SpinnerIcon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
    </button>
  )
}

/** Big "Play" button for song/album/playlist/artist heroes. */
export function PlayAll({ tracks, label = "Play" }: { tracks: Track[]; label?: string }) {
  const p = usePlayer()
  const active = !!p.current && tracks.some((t) => t.id === p.current!.id)
  const on = active && p.playing
  return (
    <button
      onClick={() => (active ? p.toggle() : p.play(tracks, 0))}
      disabled={!tracks.length}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-night-900 shadow-lg shadow-accent/20 transition hover:scale-[1.03] hover:bg-accent-2 disabled:opacity-50"
    >
      {active && p.loading ? <SpinnerIcon /> : on ? <PauseIcon /> : <PlayIcon />}
      {on ? "Pause" : label}
    </button>
  )
}

export function TrackList({ tracks, showAlbum = true, numbered = true }: { tracks: Track[]; showAlbum?: boolean; numbered?: boolean }) {
  const p = usePlayer()
  if (!tracks.length) return <p className="py-6 text-white/60">No songs found.</p>
  return (
    <ol className="divide-y divide-white/5">
      {tracks.map((t, i) => {
        const isCur = p.current?.id === t.id
        return (
          <li
            key={`${t.id}-${i}`}
            className={`group grid grid-cols-[2rem_3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5 md:grid-cols-[2.5rem_3rem_minmax(0,1fr)_minmax(0,14rem)_3rem_auto] ${isCur ? "bg-white/5" : ""}`}
          >
            <button
              onClick={() => (isCur ? p.toggle() : p.play(tracks, i))}
              aria-label={isCur && p.playing ? `Pause ${t.name}` : `Play ${t.name}`}
              className="grid h-8 w-8 place-items-center text-sm tabular-nums text-white/50"
            >
              {isCur && p.playing ? (
                <span className="text-accent">
                  <EqIcon />
                </span>
              ) : (
                <>
                  <span className={numbered ? "group-hover:hidden" : "hidden"}>{i + 1}</span>
                  <PlayIcon className={`h-4 w-4 text-white ${numbered ? "hidden group-hover:block" : ""}`} />
                </>
              )}
            </button>
            <img src={t.thumb || t.image} alt={t.name} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-md object-cover" />
            <div className="min-w-0">
              <Link href={t.href} className={`block truncate font-medium hover:underline ${isCur ? "text-accent" : "text-white"}`}>
                {t.name}
              </Link>
              <p className="truncate text-sm text-white/55">{t.artists}</p>
            </div>
            {showAlbum ? <p className="hidden truncate text-sm text-white/45 md:block">{t.album}</p> : <span className="hidden md:block" />}
            <span className="hidden text-right text-sm tabular-nums text-white/45 md:block">{t.duration ? fmtTime(t.duration) : ""}</span>
            <DownloadButton track={t} />
          </li>
        )
      })}
    </ol>
  )
}
