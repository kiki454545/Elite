'use client'

import { useAllAds } from '@/hooks/useAllAds'

export function SeoHero() {
  const { totalAds, loading } = useAllAds()

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Annonces Escortes & Libertines Premium
      </h1>
      <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
        Découvrez <strong className="text-pink-400">SexElite</strong>, la plateforme N°1 d'annonces d'<strong>escortes</strong> et de rencontres <strong>libertines</strong>.
        {loading ? (
          <> Chargement des profils...</>
        ) : (
          <> Plus de {totalAds} profils vérifiés d'escorts de luxe, accompagnatrices et libertines vous attendent.</>
        )}
      </p>
    </section>
  )
}

export function SeoFooterContent() {
  const { totalAds, topCities, loading } = useAllAds()

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 text-gray-300">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            🌟 Pourquoi choisir SexElite ?
          </h2>
          <ul className="space-y-3">
            <li>✅ <strong>Profils vérifiés</strong> - Toutes nos escortes sont authentiques</li>
            <li>✅ <strong>Discrétion absolue</strong> - Confidentialité garantie</li>
            {loading ? (
              <li>✅ <strong>Large sélection</strong> - Chargement...</li>
            ) : (
              <li>✅ <strong>Large sélection</strong> - Plus de {totalAds} annonces disponibles</li>
            )}
            <li>✅ <strong>Escorts premium</strong> - Accompagnatrices de luxe</li>
            <li>✅ <strong>Mise à jour quotidienne</strong> - Nouvelles annonces chaque jour</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            📍 Villes principales
          </h2>
          <p className="mb-4">
            Trouvez des <strong>escortes</strong> et rencontres <strong>libertines</strong> dans toutes les principales villes :
          </p>
          {loading ? (
            <p className="text-gray-400">Chargement des villes...</p>
          ) : (
            <ul className="space-y-2">
              {topCities.map(({ city, count }, index) => (
                <li key={city}>
                  • <strong>{city}</strong> - {count} {count > 1 ? 'annonces' : 'annonce'}
                  {index === 0 && ' - La plus active'}
                </li>
              ))}
              {topCities.length > 0 && <li className="text-gray-500">et plus encore...</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          💎 Rencontres libertines et escorts de luxe
        </h2>
        <p className="mb-4">
          <strong>SexElite</strong> est votre destination privilégiée pour trouver des <strong>escortes premium</strong> et des rencontres <strong>libertines</strong>.
          Notre plateforme met en relation des clients exigeants avec des <strong>accompagnatrices professionnelles</strong> qui offrent des services haut de gamme.
        </p>
        <p>
          Que vous recherchiez une <strong>escort girl</strong> pour un dîner d'affaires, une soirée mondaine ou un moment d'intimité,
          nos profils vérifiés vous garantissent des rencontres de qualité dans un cadre totalement discret et sécurisé.
        </p>
      </div>
    </section>
  )
}
