"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { Track } from "@/lib/types"

const STORAGE_KEY = "tunestation_favorites_v1"

type FavCtx = {
  favorites: Track[]
  isFav: (id: string) => boolean
  toggleFav: (track: Track) => void
  removeFav: (id: string) => void
  clearFavs: () => void
}

const FavoritesContext = createContext<FavCtx | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Track[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setFavorites(parsed)
      }
    } catch {
      // Storage unavailable or invalid JSON
    } finally {
      setLoaded(true)
    }
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // Storage full or quota exceeded
    }
  }, [favorites, loaded])

  const isFav = useCallback(
    (id: string) => favorites.some((t) => t.id === id),
    [favorites]
  )

  const toggleFav = useCallback((track: Track) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.id === track.id)
      if (exists) {
        return prev.filter((t) => t.id !== track.id)
      }
      return [track, ...prev]
    })
  }, [])

  const removeFav = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearFavs = useCallback(() => {
    setFavorites([])
  }, [])

  return (
    <FavoritesContext.Provider value={{ favorites, isFav, toggleFav, removeFav, clearFavs }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)!
