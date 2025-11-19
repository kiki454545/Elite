'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Disclaimer légal */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-pink-400 font-bold text-sm mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {t('legalFooter.legalNotice')}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            {t('legalFooter.disclaimer')}
          </p>
        </div>

        {/* Informations du site */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* À propos */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">{t('legalFooter.about')}</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              {t('legalFooter.aboutDesc')}
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">{t('legalFooter.usefulLinks')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/terms" className="text-gray-400 hover:text-pink-400 transition-colors">
                  {t('legalFooter.termsOfService')}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-pink-400 transition-colors">
                  {t('legalFooter.privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-pink-400 transition-colors">
                  {t('legalFooter.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Sécurité */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">{t('legalFooter.securityAndPrivacy')}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('legalFooter.secureSSL')}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('legalFooter.encryptedData')}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('legalFooter.privacyRespect')}
              </li>
            </ul>
          </div>
        </div>

        {/* Avertissement 18+ */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex items-center justify-center gap-3 text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold text-sm">
              {t('legalFooter.adults18Plus')}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} SexElite.eu - {t('legalFooter.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
