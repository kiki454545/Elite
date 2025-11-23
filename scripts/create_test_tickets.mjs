import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const pseudos = [
  'Sophie', 'Marie', 'Léa', 'Emma', 'Chloé', 'Laura', 'Camille', 'Manon',
  'Julie', 'Sarah', 'Clara', 'Océane', 'Lisa', 'Jade', 'Alice', 'Luna',
  'Inès', 'Mia', 'Charlotte', 'Lola', 'Eva', 'Rose', 'Anna', 'Lily',
  'Zoé', 'Nina', 'Elena', 'Maya', 'Nora', 'Lou'
]

const ranks = ['elite', 'vip', 'plus', 'standard']

const subjects = [
  'Problème de paiement',
  'Modification de profil',
  'Question sur la vérification',
  'Bug dans l\'interface',
  'Demande de remboursement',
  'Aide pour créer une annonce',
  'Photo non visible',
  'Problème de connexion',
  'Question sur les EliteCoins',
  'Compte bloqué',
  'Signalement abusif',
  'Besoin d\'assistance',
  'Erreur lors de l\'upload',
  'Question sur les rangs',
  'Demande d\'information'
]

const messages = [
  'Bonjour, j\'ai besoin d\'aide concernant mon compte.',
  'Je rencontre un problème technique.',
  'Pouvez-vous m\'aider s\'il vous plaît ?',
  'J\'ai une question urgente.',
  'Mon compte ne fonctionne pas correctement.',
  'J\'aimerais avoir des informations supplémentaires.',
  'Il y a un bug que je ne comprends pas.',
  'Merci de votre aide par avance.',
  'C\'est assez urgent, pouvez-vous traiter rapidement ?',
  'J\'attends votre réponse.'
]

const priorities = ['low', 'medium', 'high']

async function createTestTickets() {
  console.log('🎫 Création de 30 tickets de test...\n')

  // Récupérer tous les profils existants
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, rank')

  if (profilesError) {
    console.error('❌ Erreur lors de la récupération des profils:', profilesError)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.error('❌ Aucun profil trouvé dans la base de données')
    return
  }

  console.log(`✅ ${profiles.length} profils trouvés\n`)

  // Grouper les profils par rang
  const profilesByRank = {
    elite: profiles.filter(p => p.rank === 'elite'),
    vip: profiles.filter(p => p.rank === 'vip'),
    plus: profiles.filter(p => p.rank === 'plus'),
    standard: profiles.filter(p => p.rank === 'standard' || !p.rank)
  }

  console.log('📊 Distribution des profils par rang:')
  console.log(`   Elite: ${profilesByRank.elite.length}`)
  console.log(`   VIP: ${profilesByRank.vip.length}`)
  console.log(`   Plus: ${profilesByRank.plus.length}`)
  console.log(`   Standard: ${profilesByRank.standard.length}\n`)

  const tickets = []
  const now = new Date()

  for (let i = 0; i < 30; i++) {
    // Répartir les rangs de manière équilibrée
    let rank
    if (i < 8) rank = 'elite'
    else if (i < 16) rank = 'vip'
    else if (i < 24) rank = 'plus'
    else rank = 'standard'

    // Sélectionner un profil aléatoire du rang choisi
    const availableProfiles = profilesByRank[rank]
    if (availableProfiles.length === 0) {
      console.log(`⚠️  Aucun profil ${rank} disponible, utilisation d'un profil standard`)
      availableProfiles = profilesByRank.standard
    }

    const profile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)]

    // Créer une date aléatoire dans les 30 derniers jours
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)

    const ticketDate = new Date(now)
    ticketDate.setDate(ticketDate.getDate() - daysAgo)
    ticketDate.setHours(ticketDate.getHours() - hoursAgo)
    ticketDate.setMinutes(ticketDate.getMinutes() - minutesAgo)

    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]

    tickets.push({
      user_id: profile.id,
      subject: subject,
      message: message,
      priority: priority,
      status: 'open',
      created_at: ticketDate.toISOString()
    })
  }

  // Insérer tous les tickets
  const { data: insertedTickets, error: insertError } = await supabase
    .from('support_tickets')
    .insert(tickets)
    .select()

  if (insertError) {
    console.error('❌ Erreur lors de l\'insertion des tickets:', insertError)
    return
  }

  console.log(`✅ ${insertedTickets.length} tickets créés avec succès!\n`)

  // Afficher un résumé
  const ticketsByRank = {
    elite: 0,
    vip: 0,
    plus: 0,
    standard: 0
  }

  for (const ticket of insertedTickets) {
    const profile = profiles.find(p => p.id === ticket.user_id)
    const rank = profile?.rank || 'standard'
    ticketsByRank[rank]++
  }

  console.log('📊 Répartition des tickets créés:')
  console.log(`   Elite: ${ticketsByRank.elite} tickets`)
  console.log(`   VIP: ${ticketsByRank.vip} tickets`)
  console.log(`   Plus: ${ticketsByRank.plus} tickets`)
  console.log(`   Standard: ${ticketsByRank.standard} tickets`)
  console.log('\n✨ Terminé!')
}

createTestTickets()
