'use client'

import { useEffect, useRef } from 'react'

export function VisitorTracker() {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Ne tracker qu'une seule fois par session
    if (hasTracked.current) return

    // Vérifier si déjà tracké dans cette session
    const sessionTracked = sessionStorage.getItem('visitor_tracked')
    if (sessionTracked) return

    const trackVisit = async () => {
      try {
        await fetch('/api/stats/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: window.location.pathname
          })
        })

        // Marquer comme tracké pour cette session
        sessionStorage.setItem('visitor_tracked', 'true')
        hasTracked.current = true
      } catch (error) {
        // Silencieux en cas d'erreur
        console.error('Tracking error:', error)
      }
    }

    trackVisit()
  }, [])

  // Composant invisible
  return null
}
