'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCountry, COUNTRIES } from '@/contexts/CountryContext'

export default function TopWeekPage() {
  const router = useRouter()
  const { setSelectedCountry } = useCountry()

  useEffect(() => {
    // Sélectionner "Choix du Pays" pour afficher le top semaine
    setSelectedCountry(COUNTRIES[0]) // ALL
    // Rediriger vers la homepage
    router.push('/')
  }, [router, setSelectedCountry])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Redirection...</p>
    </div>
  )
}
