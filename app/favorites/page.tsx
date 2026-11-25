"use client"

import Link from "next/link"
import { useFavorites } from "@/components/favorites-context"
import { PlayAll, TrackList } from "@/components/tracks"
import { HeartIcon } from "@/components/icons"
import { Crumbs } from "@/components/ui"

export default function FavoritesPage() {
  const { favorites, clearFavs } = useFavorites()

  return (
    <div className="mx-auto max-w-4xl py-6">
      <Crumbs items={[{ name: "Home", href: "/" }, { name: "Favorites" }]} />

      <div className="mt-4 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <HeartIcon filled className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Favorite Songs</h1>
              <p className="mt-1 text-sm text-white/60">
                {favorites.length} {favorites.length === 1 ? "track" : "tracks"} saved locally on this device
              </p>
            </div>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <PlayAll tracks={favorites} label="Play all favorites" />
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all favorite songs?")) {
                  clearFavs()
                }
              }}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/60 transition hover:border-red-400 hover:text-red-400"
            >
              Clear list
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        {favorites.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/30">
              <HeartIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No favorite songs yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/55">
              Tap the heart icon on any song page, track row, or bottom music player to bookmark your favorite tracks.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/songs/hindi"
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-night-900 transition hover:bg-accent-2"
              >
                Browse Hindi Songs
              </Link>
              <Link
                href="/"
                className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/5"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <TrackList tracks={favorites} showAlbum={true} numbered={true} />
        )}
      </div>
    </div>
  )
}
