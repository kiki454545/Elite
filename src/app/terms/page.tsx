'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
            Conditions d'Utilisation
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
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptation des Conditions</h2>
            <p className="leading-relaxed">
              En accédant et en utilisant la plateforme SexElite, vous acceptez d'être lié par les présentes conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Âge Minimum et Contenu pour Adultes</h2>
            <p className="leading-relaxed mb-3">
              <strong className="text-pink-500">IMPORTANT :</strong> SexElite est une plateforme réservée exclusivement aux adultes.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Vous devez avoir au moins 18 ans pour utiliser ce service</li>
              <li>Vous certifiez que vous avez l'âge légal dans votre juridiction</li>
              <li>Le contenu peut être de nature explicite et réservé à un public adulte</li>
              <li>Toute fausse déclaration concernant votre âge entraînera la suspension immédiate de votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Création de Compte</h2>
            <p className="leading-relaxed mb-3">Pour créer un compte, vous devez :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la sécurité de votre mot de passe</li>
              <li>Ne pas partager votre compte avec des tiers</li>
              <li>Informer immédiatement en cas d'utilisation non autorisée</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Règles de Conduite</h2>
            <p className="leading-relaxed mb-3">Il est strictement interdit de :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Publier du contenu illégal, offensant ou diffamatoire</li>
              <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
              <li>Usurper l'identité d'une autre personne</li>
              <li>Partager du contenu impliquant des mineurs</li>
              <li>Promouvoir des services illégaux</li>
              <li>Utiliser la plateforme pour toute activité frauduleuse</li>
              <li>Spammer ou envoyer des messages non sollicités</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Annonces et Contenu</h2>
            <p className="leading-relaxed mb-3">Concernant vos annonces :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Vous êtes responsable du contenu que vous publiez</li>
              <li>Vous garantissez détenir les droits sur les photos/vidéos publiées</li>
              <li>Les annonces doivent respecter les lois locales</li>
              <li>Le contenu doit être véridique et non trompeur</li>
              <li>Nous nous réservons le droit de modérer et supprimer tout contenu inapproprié</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Paiements et Abonnements</h2>
            <p className="leading-relaxed mb-3">Conditions financières :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Les tarifs des abonnements Premium sont indiqués clairement</li>
              <li>Les paiements sont traités de manière sécurisée</li>
              <li>Les abonnements se renouvellent automatiquement sauf annulation</li>
              <li>Aucun remboursement pour les services déjà utilisés</li>
              <li>Nous nous réservons le droit de modifier les tarifs avec préavis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Propriété Intellectuelle</h2>
            <p className="leading-relaxed">
              Tous les éléments de la plateforme (logo, design, code) sont protégés par des droits d'auteur.
              Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation de Responsabilité</h2>
            <p className="leading-relaxed mb-3">SexElite :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Ne garantit pas la véracité des informations publiées par les utilisateurs</li>
              <li>N'est pas responsable des interactions entre utilisateurs</li>
              <li>Ne peut être tenu responsable des dommages directs ou indirects</li>
              <li>Décline toute responsabilité concernant les services externes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Suspension et Résiliation</h2>
            <p className="leading-relaxed mb-3">Nous pouvons suspendre ou résilier votre compte :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>En cas de violation des présentes conditions</li>
              <li>Si votre comportement nuit à la communauté</li>
              <li>Pour activité suspecte ou frauduleuse</li>
              <li>À notre discrétion, avec ou sans préavis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Modifications des Conditions</h2>
            <p className="leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés
              des changements importants. L'utilisation continue de la plateforme après modification constitue
              l'acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Droit Applicable</h2>
            <p className="leading-relaxed">
              Ces conditions sont régies par les lois françaises. Tout litige sera soumis à la juridiction
              exclusive des tribunaux français.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
            <p className="leading-relaxed">
              Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à :<br />
              <a href="mailto:legal@sexelite.com" className="text-pink-500 hover:text-pink-400">
                legal@sexelite.com
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-500 italic">
              En utilisant SexElite, vous reconnaissez avoir lu, compris et accepté l'intégralité de ces conditions d'utilisation.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
