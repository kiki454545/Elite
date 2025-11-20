'use client'

import { useEffect } from 'react'
import { useAllAds } from '@/hooks/useAllAds'

export function DynamicMetadata() {
  const { totalAds, loading } = useAllAds()

  useEffect(() => {
    if (!loading && totalAds > 0) {
      // Mettre à jour le titre de la page dynamiquement
      document.title = `SexElite - Annonces Escortes & Libertines Premium | Plus de ${totalAds} Profils`

      // Mettre à jour la meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute(
          'content',
          `SexElite : Plateforme N°1 d'annonces escortes et libertines. Découvrez plus de ${totalAds} profils vérifiés d'escorts de luxe, accompagnatrices et libertines. Discrétion absolue garantie.`
        )
      }

      // Mettre à jour Open Graph title
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', `SexElite - Annonces Escortes & Libertines Premium | ${totalAds} Profils`)
      }

      // Mettre à jour Open Graph description
      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', `Plus de ${totalAds} profils vérifiés d'escorts et libertines de luxe`)
      }
    }
  }, [totalAds, loading])

  return null // Ce composant ne rend rien visuellement
}
