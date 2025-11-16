'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useFavorites as useSupabaseFavorites } from '@/hooks/useFavorites'

interface FavoritesContextType {
  favorites: string[]
  addToFavorites: (adId: string) => Promise<boolean>
  removeFromFavorites: (adId: string) => Promise<boolean>
  isFavorite: (adId: string) => boolean
  toggleFavorite: (adId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite: toggleSupabaseFavorite,
    isFavorite: isSupabaseFavorite
  } = useSupabaseFavorites()

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites: addFavorite,
        removeFromFavorites: removeFavorite,
        isFavorite: isSupabaseFavorite,
        toggleFavorite: toggleSupabaseFavorite,
        loading,
        error
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
