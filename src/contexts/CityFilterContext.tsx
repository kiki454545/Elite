'use client'

import { createContext, useContext, useState, useMemo, ReactNode } from 'react'

interface CityFilterContextType {
  selectedCity: string | null
  setSelectedCity: (city: string | null) => void
}

const CityFilterContext = createContext<CityFilterContextType | undefined>(undefined)

export function CityFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const value = useMemo(() => ({
    selectedCity,
    setSelectedCity
  }), [selectedCity])

  return (
    <CityFilterContext.Provider value={value}>
      {children}
    </CityFilterContext.Provider>
  )
}

export function useCityFilter() {
  const context = useContext(CityFilterContext)
  if (context === undefined) {
    throw new Error('useCityFilter must be used within a CityFilterProvider')
  }
  return context
}
