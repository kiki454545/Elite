'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour à l'accueil</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-400">Dernière mise à jour : 11 Novembre 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6 text-gray-300"
        >
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
            </div>
            <p className="leading-relaxed">
              Chez SexElite, nous prenons la protection de vos données personnelles très au sérieux. Cette politique
              de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations
              personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">2. Données Collectées</h2>
            </div>
            <p className="leading-relaxed mb-3">Nous collectons les informations suivantes :</p>

            <div className="space-y-4 ml-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Données d'inscription :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Pseudo</li>
                  <li>Adresse e-mail</li>
                  <li>Mot de passe (crypté)</li>
                  <li>Âge</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Données de profil :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Photos et médias publiés</li>
                  <li>Description et services proposés</li>
                  <li>Localisation (ville)</li>
                  <li>Informations de contact</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Données techniques :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Données de connexion</li>
                  <li>Cookies et technologies similaires</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Données d'utilisation :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Pages visitées</li>
                  <li>Interactions avec d'autres utilisateurs</li>
                  <li>Messages envoyés</li>
                  <li>Favoris et préférences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">3. Utilisation des Données</h2>
            </div>
            <p className="leading-relaxed mb-3">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Fournir nos services et fonctionnalités</li>
              <li>Personnaliser votre expérience</li>
              <li>Améliorer notre plateforme</li>
              <li>Communiquer avec vous (notifications, support)</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
              <li>Respecter nos obligations légales</li>
              <li>Traiter les paiements (abonnements Premium)</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">4. Protection des Données</h2>
            </div>
            <p className="leading-relaxed mb-3">Nous mettons en œuvre des mesures de sécurité strictes :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Cryptage SSL/TLS pour toutes les communications</li>
              <li>Mots de passe chiffrés avec algorithmes sécurisés</li>
              <li>Serveurs sécurisés avec accès restreint</li>
              <li>Surveillance continue des menaces de sécurité</li>
              <li>Sauvegardes régulières des données</li>
              <li>Formation du personnel sur la protection des données</li>
              <li>Conformité aux normes de sécurité internationales</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">5. Vos Droits (RGPD)</h2>
            </div>
            <p className="leading-relaxed mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
              <li><strong className="text-white">Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong className="text-white">Droit à l'effacement :</strong> Supprimer vos données ("droit à l'oubli")</li>
              <li><strong className="text-white">Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
              <li><strong className="text-white">Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
              <li><strong className="text-white">Droit d'opposition :</strong> S'opposer au traitement de vos données</li>
              <li><strong className="text-white">Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Pour exercer ces droits, contactez-nous à :
              <a href="mailto:privacy@sexelite.com" className="text-pink-500 hover:text-pink-400 ml-1">
                privacy@sexelite.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Partage des Données</h2>
            <p className="leading-relaxed mb-3">
              <strong className="text-white">Nous ne vendons JAMAIS vos données personnelles.</strong>
            </p>
            <p className="leading-relaxed mb-3">Vos données peuvent être partagées uniquement avec :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Processeurs de paiement :</strong> Pour traiter les transactions (conformément aux normes PCI-DSS)</li>
              <li><strong className="text-white">Services d'hébergement :</strong> Pour stocker et gérer les données de manière sécurisée</li>
              <li><strong className="text-white">Outils d'analyse :</strong> Pour améliorer nos services (données anonymisées)</li>
              <li><strong className="text-white">Autorités légales :</strong> Si requis par la loi ou pour protéger nos droits</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Tous nos partenaires sont soumis à des obligations strictes de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
            <p className="leading-relaxed mb-3">Nous utilisons des cookies pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Cookies essentiels :</strong> Fonctionnement de la plateforme (sessions, authentification)</li>
              <li><strong className="text-white">Cookies de performance :</strong> Analyser l'utilisation de la plateforme</li>
              <li><strong className="text-white">Cookies de préférence :</strong> Mémoriser vos choix et paramètres</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Vous pouvez gérer les cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Conservation des Données</h2>
            <p className="leading-relaxed mb-3">Nous conservons vos données :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Tant que votre compte est actif</li>
              <li>Pendant la durée nécessaire pour fournir nos services</li>
              <li>Pour respecter nos obligations légales (généralement 3 ans après suppression)</li>
              <li>Les données de paiement sont conservées selon les exigences légales</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Après suppression de votre compte, vos données personnelles sont effacées sous 30 jours,
              sauf obligation légale de conservation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Transferts Internationaux</h2>
            <p className="leading-relaxed">
              Vos données sont principalement stockées dans l'Union Européenne. Si un transfert hors UE est nécessaire,
              nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, Privacy Shield, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Mineurs</h2>
            <p className="leading-relaxed">
              <strong className="text-pink-500">Notre plateforme est strictement interdite aux mineurs.</strong> Nous ne collectons
              pas sciemment de données concernant des personnes de moins de 18 ans. Si nous découvrons qu'un mineur a créé un compte,
              celui-ci sera immédiatement supprimé.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-white">11. Violations de Données</h2>
            </div>
            <p className="leading-relaxed">
              En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et libertés,
              nous vous en informerons dans les 72 heures et notifierons les autorités compétentes (CNIL en France).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Modifications de la Politique</h2>
            <p className="leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes seront
              notifiées par e-mail ou via une notification sur la plateforme. La date de dernière mise à jour est
              indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact et Réclamations</h2>
            <p className="leading-relaxed mb-3">
              Pour toute question concernant cette politique ou pour exercer vos droits :
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p><strong className="text-white">E-mail :</strong> <a href="mailto:privacy@sexelite.com" className="text-pink-500 hover:text-pink-400">privacy@sexelite.com</a></p>
              <p><strong className="text-white">Délégué à la Protection des Données (DPO) :</strong> <a href="mailto:dpo@sexelite.com" className="text-pink-500 hover:text-pink-400">dpo@sexelite.com</a></p>
            </div>
            <p className="leading-relaxed mt-3">
              Vous avez également le droit de déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 ml-1">
                www.cnil.fr
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-gray-800">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong className="text-white">Engagement de confidentialité :</strong> Votre vie privée est notre priorité.
                Nous nous engageons à protéger vos données personnelles et à les utiliser de manière transparente et responsable,
                conformément aux lois en vigueur.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
