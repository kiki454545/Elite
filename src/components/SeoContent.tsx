'use client'

import { useAllAds } from '@/hooks/useAllAds'
import { useLanguage } from '@/contexts/LanguageContext'

export function SeoHero() {
  const { totalAds, loading } = useAllAds()
  const { t } = useLanguage()

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        {t('home.seo.hero.title')}
      </h1>
      <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
        <span dangerouslySetInnerHTML={{ __html: t('home.seo.hero.description') }} />
        {loading ? (
          <> {t('home.seo.hero.loadingProfiles')}</>
        ) : (
          <> {t('home.seo.hero.profilesAvailable', { count: totalAds })}</>
        )}
      </p>
    </section>
  )
}

export function SeoFooterContent() {
  const { totalAds, topCities, loading } = useAllAds()
  const { t } = useLanguage()

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 text-gray-300">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('home.seo.whyChoose.title')}
          </h2>
          <ul className="space-y-3">
            <li>✅ {t('home.seo.whyChoose.verifiedProfiles')}</li>
            <li>✅ {t('home.seo.whyChoose.absoluteDiscretion')}</li>
            {loading ? (
              <li>✅ {t('home.seo.whyChoose.loading')}</li>
            ) : (
              <li>✅ {t('home.seo.whyChoose.largeSelection', { count: totalAds })}</li>
            )}
            <li>✅ {t('home.seo.whyChoose.premiumEscorts')}</li>
            <li>✅ {t('home.seo.whyChoose.dailyUpdate')}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('home.seo.topCities.title')}
          </h2>
          <p className="mb-4">
            <span dangerouslySetInnerHTML={{ __html: t('home.seo.topCities.description') }} />
          </p>
          {loading ? (
            <p className="text-gray-400">{t('home.seo.topCities.loadingCities')}</p>
          ) : (
            <ul className="space-y-2">
              {topCities.map(({ city, count }, index) => (
                <li key={city}>
                  • <strong>{city}</strong> - {count} {count > 1 ? t('home.seo.topCities.listings') : t('home.seo.topCities.listing')}
                  {index === 0 && ` - ${t('home.seo.topCities.mostActive')}`}
                </li>
              ))}
              {topCities.length > 0 && <li className="text-gray-500">{t('home.seo.topCities.andMore')}</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('home.seo.aboutSection.title')}
        </h2>
        <p className="mb-4">
          <span dangerouslySetInnerHTML={{ __html: t('home.seo.aboutSection.description1') }} />
        </p>
        <p>
          <span dangerouslySetInnerHTML={{ __html: t('home.seo.aboutSection.description2') }} />
        </p>
      </div>
    </section>
  )
}
