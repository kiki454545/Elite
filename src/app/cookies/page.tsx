'use client'

import { motion } from 'framer-motion'
import { Cookie, Shield, Eye, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function CookiesPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      router.push('/profile/support')
    } else {
      router.push('/auth')
    }
  }
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 mb-6">
            <Cookie className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Politique de Cookies
          </h1>
          <p className="text-xl text-gray-400">
            Transparence et respect de votre vie privée
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-8 md:p-12 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Info className="w-6 h-6 text-pink-500" />
              Qu'est-ce qu'un cookie ?
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil par votre navigateur
              web lorsque vous visitez un site internet. Les cookies permettent au site de mémoriser
              vos actions et préférences sur une période donnée.
            </p>
          </section>

          {/* Cookies utilisés */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Cookie className="w-6 h-6 text-pink-500" />
              Les cookies que nous utilisons
            </h2>

            <div className="space-y-4">
              {/* Cookies essentiels */}
              <div className="p-6 bg-gray-800/50 rounded-xl border border-green-500/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Cookies essentiels
                    </h3>
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-3">
                      Toujours actifs
                    </span>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Ces cookies sont nécessaires au bon fonctionnement du site et ne peuvent
                      pas être désactivés. Ils sont généralement définis en réponse à des actions
                      que vous effectuez (connexion, paramètres de confidentialité, etc.).
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 mt-1">•</span>
                        <div>
                          <p className="text-white font-medium">sb-access-token</p>
                          <p className="text-sm text-gray-400">
                            Token d'authentification JWT pour maintenir votre session
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Durée : 1 heure</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 mt-1">•</span>
                        <div>
                          <p className="text-white font-medium">sb-refresh-token</p>
                          <p className="text-sm text-gray-400">
                            Token de renouvellement pour prolonger votre session
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Durée : 7 jours</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500 mt-1">•</span>
                        <div>
                          <p className="text-white font-medium">cookie-consent</p>
                          <p className="text-sm text-gray-400">
                            Mémorise vos préférences concernant les cookies
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Durée : 1 an</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies non utilisés */}
              <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Cookies analytiques et publicitaires
                    </h3>
                    <span className="inline-block px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm font-medium mb-3">
                      Non utilisés
                    </span>
                    <p className="text-gray-300 leading-relaxed">
                      Nous n'utilisons <strong className="text-white">aucun cookie de tracking,
                      d'analyse ou de publicité</strong>. Votre navigation sur notre site
                      reste privée et n'est pas suivie par des outils tiers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-pink-500" />
              Durée de conservation
            </h2>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>
                    <strong className="text-white">Cookies de session</strong> : Supprimés
                    automatiquement lorsque vous fermez votre navigateur
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>
                    <strong className="text-white">Cookies persistants</strong> : Conservés
                    jusqu'à 7 jours maximum pour maintenir votre connexion
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Gestion des cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-pink-500" />
              Comment gérer vos cookies ?
            </h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                Vous pouvez à tout moment choisir de désactiver les cookies dans les paramètres
                de votre navigateur. Cependant, certaines fonctionnalités du site pourraient
                ne plus fonctionner correctement.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                  { name: 'Firefox', url: 'https://support.mozilla.org/fr/kb/activer-desactiver-cookies' },
                  { name: 'Safari', url: 'https://support.apple.com/fr-fr/guide/safari/sfri11471/mac' },
                  { name: 'Edge', url: 'https://support.microsoft.com/fr-fr/windows/supprimer-et-g%C3%A9rer-les-cookies-168dab11-0753-043d-7c16-ede5947fc64d' }
                ].map((browser) => (
                  <a
                    key={browser.name}
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-pink-500/50 transition-all duration-300 group"
                  >
                    <p className="text-white font-medium group-hover:text-pink-400 transition-colors">
                      Gérer les cookies sur {browser.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Guide officiel →</p>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Des questions ?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Si vous avez des questions concernant notre utilisation des cookies, n'hésitez
              pas à nous contacter.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-pink-500/25"
            >
              Nous contacter
            </button>
          </section>

          {/* Date de mise à jour */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-800">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </motion.div>

        {/* Retour */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className="text-gray-400 hover:text-pink-400 transition-colors inline-flex items-center gap-2"
          >
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
