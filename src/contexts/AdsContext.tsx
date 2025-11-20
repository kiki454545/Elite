'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAds } from '@/hooks/useAds'
import { useCountry } from '@/contexts/CountryContext'
import { Ad } from '@/types/ad'

interface AdsContextType {
  ads: Ad[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const AdsContext = createContext<AdsContextType | undefined>(undefined)

export function AdsProvider({ children }: { children: ReactNode }) {
  const { selectedCountry, isDetectingCountry } = useCountry()

  // Charger TOUTES les annonces du pays (sans filtre de ville)
  // Les composants individuels peuvent filtrer par ville localement
  const { ads, loading, error, refetch } = useAds(
    isDetectingCountry ? undefined : selectedCountry.code,
    undefined // Pas de filtre de ville - on charge tout
  )

  return (
    <AdsContext.Provider value={{ ads, loading, error, refetch }}>
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
