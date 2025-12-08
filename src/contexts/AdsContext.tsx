'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAds } from '@/hooks/useAds'
import { useCountry } from '@/contexts/CountryContext'
import { Ad } from '@/types/ad'

interface AdsContextType {
  ads: Ad[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  totalCount: number
  loadMore: () => void
  refetch: () => void
}

const AdsContext = createContext<AdsContextType | undefined>(undefined)

export function AdsProvider({ children }: { children: ReactNode }) {
  const { selectedCountry, isDetectingCountry } = useCountry()

  // Charger les annonces du pays avec infinite scroll
  const { ads, loading, loadingMore, error, hasMore, totalCount, loadMore, refetch } = useAds(
    isDetectingCountry ? undefined : selectedCountry.code,
    undefined // Pas de filtre de ville - on charge tout
  )

  return (
    <AdsContext.Provider value={{ ads, loading, loadingMore, error, hasMore, totalCount, loadMore, refetch }}>
      {children}
    </AdsContext.Provider>
  )
}

export function useAdsContext() {
  const context = useContext(AdsContext)
  if (context === undefined) {
    throw new Error('useAdsContext must be used within an AdsProvider')
  }
  return context
}
