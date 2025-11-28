'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Tracker la visite
    const trackVisit = async () => {
      try {
        await fetch('/api/stats/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: pathname
          })
        })
      } catch (error) {
        // Silencieux en cas d'erreur
        console.error('Tracking error:', error)
      }
    }

    trackVisit()
  }, [pathname])

  // Composant invisible
  return null
}
