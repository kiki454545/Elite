import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non défini')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Configuration
const PASSWORD = 'aaaaaa'
const EMAIL_PREFIX = 'escorte'
const EMAIL_DOMAIN = '@gmail.com'

// URL à scraper (passée en argument)
const url = process.argv[2]

if (!url) {
  console.error('❌ Usage: node scrape_and_import.mjs <URL>')
  console.error('   Exemple: node scrape_and_import.mjs "https://www.sexemodel.com/escort/Mira-2334725/"')
  process.exit(1)
}

// Fonction pour demander une entrée simple à l'utilisateur
function askUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// Fonction pour demander la description à l'utilisateur
function askDescription() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log('\n📝 Colle la description "A propos de moi" (termine par une ligne vide):')

    let description = ''
    let emptyLineCount = 0

    rl.on('line', (line) => {
      if (line === '') {
        emptyLineCount++
        if (emptyLineCount >= 1) {
          rl.close()
          resolve(description.trim())
        } else {
          description += '\n'
        }
      } else {
        emptyLineCount = 0
        description += (description ? '\n' : '') + line
      }
    })
  })
}

// Fonction pour extraire les données via WebFetch-like approach
async function scrapeWithFetch(url) {
  console.log(`\n🔍 Récupération des données depuis: ${url}`)

  // Extraire le nom depuis l'URL
  const nameMatch = url.match(/\/escort\/([^-\/]+)/i)
  let username = nameMatch ? decodeURIComponent(nameMatch[1]).replace(/_/g, ' ').trim() : 'Inconnu'

  // Nettoyer le nom (enlever %20, etc.)
  username = username.replace(/%20/g, ' ').trim()

  // Capitaliser la première lettre
  username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()

  console.log(`   Nom extrait de l'URL: ${username}`)

  // Pour le reste des données, on va faire un fetch basique
  // et essayer d'extraire ce qu'on peut
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      }
    })

    if (!response.ok) {
      console.log(`   ⚠️ Impossible de charger la page (${response.status})`)
      return { username, needsManualInput: true }
    }

    const html = await response.text()

    // Extraire l'âge - plusieurs patterns
    let age = 25
    const agePatterns = [
      /(\d{2})\s*ans/i,
      /"age"[:\s]*(\d{2})/i,
      /age["\s:]+(\d{2})/i
    ]
    for (const pattern of agePatterns) {
      const match = html.match(pattern)
      if (match && parseInt(match[1]) >= 18 && parseInt(match[1]) <= 60) {
        age = parseInt(match[1])
        break
      }
    }

    // Extraire la ville UNIQUEMENT depuis "Ville de base:" sur sexemodel
    // Structure: <dt>Ville de base:</dt><dd><a href="/escorts/ville/">Ville</a></dd>
    let location = null

    // Pattern EXACT pour sexemodel: "Ville de base:" suivi du lien avec la ville
    const villeDeBaseMatch = html.match(/<dt>Ville de base:?<\/dt>\s*<dd>\s*<a[^>]*>([^<]+)<\/a>/i)
    if (villeDeBaseMatch) {
      location = villeDeBaseMatch[1].trim()
      // Capitaliser la première lettre
      location = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase()
      console.log(`   🏙️ Ville de base trouvée: ${location}`)
    } else {
      // Si pas trouvé, on ne met PAS de ville (erreur ou page 404)
      console.log(`   ❌ "Ville de base:" non trouvée - la ville ne sera pas modifiée`)
      return { username, needsManualInput: true, error: 'Ville de base non trouvée' }
    }

    // Extraire le téléphone
    let phone = ''
    const phonePatterns = [
      /tel:(\d{10})/i,
      /0[67]\d{8}/g,
      /0[67]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}/g,
      /\+33[67]\d{8}/g
    ]
    for (const pattern of phonePatterns) {
      const match = html.match(pattern)
      if (match) {
        phone = (Array.isArray(match) ? match[0] : match[1] || match[0])
          .replace(/tel:/i, '')
          .replace(/[\s.]/g, '')
          .replace(/^\+33/, '0')
        if (phone.length === 10) break
      }
    }

    // Vérifier WhatsApp
    const hasWhatsapp = /whatsapp/i.test(html)

    // Extraire la taille
    let height = 165
    const heightMatch = html.match(/(\d{3})\s*cm/i)
    if (heightMatch && parseInt(heightMatch[1]) >= 140 && parseInt(heightMatch[1]) <= 200) {
      height = parseInt(heightMatch[1])
    }

    // Extraire le poids
    let weight = 55
    const weightMatch = html.match(/(\d{2,3})\s*kg/i)
    if (weightMatch && parseInt(weightMatch[1]) >= 40 && parseInt(weightMatch[1]) <= 120) {
      weight = parseInt(weightMatch[1])
    }

    // Extraire les mensurations
    let measurements = '90-60-90'
    const measurementsMatch = html.match(/(\d{2,3})[- ](\d{2,3})[- ](\d{2,3})/)
    if (measurementsMatch) {
      measurements = `${measurementsMatch[1]}-${measurementsMatch[2]}-${measurementsMatch[3]}`
    }

    // Extraire le prix
    let price = 150
    const priceMatch = html.match(/(\d{2,4})\s*€/) || html.match(/€\s*(\d{2,4})/)
    if (priceMatch && parseInt(priceMatch[1]) >= 50 && parseInt(priceMatch[1]) <= 1000) {
      price = parseInt(priceMatch[1])
    }

    // Vérifier disponibilité 24/7
    const available247 = /24\s*[\/h]\s*7|24h|24\/24/i.test(html)

    // Vérifier incall/outcall
    const incall = /(?:reçois|incall|chez moi|appartement|studio)/i.test(html)
    const outcall = /(?:déplace|outcall|déplacement|hôtel|domicile)/i.test(html)

    // Déterminer l'origine/ethnie
    let ethnicity = 'caucasienne'
    if (/métisse|metisse/i.test(html)) ethnicity = 'metisse'
    else if (/africaine|black|ébène/i.test(html)) ethnicity = 'africaine'
    else if (/asiatique|asian|chinoise|japonaise/i.test(html)) ethnicity = 'asiatique'
    else if (/latine|latina|brésilienne/i.test(html)) ethnicity = 'latine'
    else if (/arabe|maghrébine|orientale/i.test(html)) ethnicity = 'arabe'

    // Couleur des cheveux
    let hairColor = 'brune'
    if (/blonde/i.test(html)) hairColor = 'blonde'
    else if (/rousse/i.test(html)) hairColor = 'rousse'
    else if (/châtain|chatain/i.test(html)) hairColor = 'chatain'
    else if (/noire|noir/i.test(html) && !/peau noire/i.test(html)) hairColor = 'noire'

    // Couleur des yeux
    let eyeColor = 'marrons'
    if (/yeux\s*(bleus|bleu)/i.test(html)) eyeColor = 'bleus'
    else if (/yeux\s*(verts|vert)/i.test(html)) eyeColor = 'verts'
    else if (/yeux\s*(noirs|noir)/i.test(html)) eyeColor = 'noirs'
    else if (/yeux\s*(gris)/i.test(html)) eyeColor = 'gris'
    else if (/yeux\s*(noisette)/i.test(html)) eyeColor = 'noisette'

    return {
      username,
      age,
      location,
      country: 'FR',
      phone,
      hasWhatsapp,
      acceptsCalls: true,
      acceptsSMS: true,
      gender: 'female',
      ethnicity,
      height,
      weight,
      hairColor,
      eyeColor,
      measurements,
      nationality: 'FR',
      languages: ['french'],
      available247: available247 || true,
      price,
      incall: incall || true,
      outcall: outcall || false,
      needsManualInput: false
    }

  } catch (error) {
    console.log(`   ⚠️ Erreur lors du scraping: ${error.message}`)
    return { username, needsManualInput: true }
  }
}

async function getNextEmailNumber() {
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  let maxNumber = 0
  const emailRegex = new RegExp(`^${EMAIL_PREFIX}(\\d+)${EMAIL_DOMAIN.replace('.', '\\.')}$`, 'i')

  for (const user of users?.users || []) {
    const match = user.email?.match(emailRegex)
    if (match) {
      const num = parseInt(match[1])
      if (num > maxNumber) maxNumber = num
    }
  }

  return maxNumber + 1
}

async function createAccount(email) {
  console.log(`\n📧 Création du compte: ${email}`)

  const { data: user, error } = await supabase.auth.admin.createUser({
    email: email,
    password: PASSWORD,
    email_confirm: true
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log(`   ⚠️ Compte existe déjà, récupération...`)
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users?.users?.find(u => u.email === email)
      if (existingUser) {
        return existingUser
      }
    }
    throw error
  }

  console.log(`   ✅ Compte créé: ${user.user.id}`)
  return user.user
}

async function updateProfile(userId, email, data) {
  console.log(`\n👤 Mise à jour du profil...`)

  const profileData = {
    id: userId,
    email: email,
    username: data.username,
    age: data.age,
    gender: data.gender,
    nationality: data.nationality,
    height: data.height,
    weight: data.weight,
    measurements: data.measurements,
    languages: data.languages,
    interested_in: ['men'],
    verified: false,
    rank: 'standard',
    elite_coins: 0
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData)

  if (error) {
    console.error(`   ❌ Erreur profil:`, error.message)
    throw error
  }

  console.log(`   ✅ Profil mis à jour`)
}

async function createAd(userId, data, sourceUrl) {
  console.log(`\n📝 Création de l'annonce...`)

  const adRecord = {
    user_id: userId,
    title: `${data.username} - ${data.location}`,
    description: data.description,
    location: data.location,
    country: data.country,
    price: data.price,
    categories: ['escort'],
    services: [], // Ne pas remplir
    photos: ['https://upfsgpzcvdvtuygwaizd.supabase.co/storage/v1/object/public/ad-photos/placeholder.jpg'],
    video_url: null,
    phone_number: data.phone,
    has_whatsapp: data.hasWhatsapp,
    has_telegram: false,
    accepts_calls: data.acceptsCalls,
    accepts_sms: data.acceptsSMS,
    available24_7: data.available247,
    availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    availability_hours: '00:00 - 23:59',
    incall: data.incall,
    outcall: data.outcall,
    views: 0,
    weekly_views: 0,
    favorites_count: 0,
    status: 'approved',
    source_url: sourceUrl || null
  }

  const { data: ad, error } = await supabase
    .from('ads')
    .insert(adRecord)
    .select()
    .single()

  if (error) {
    console.error(`   ❌ Erreur annonce:`, error.message)
    throw error
  }

  console.log(`   ✅ Annonce créée: ${ad.id}`)
  return ad
}

async function main() {
  console.log('🚀 Import automatique depuis URL')
  console.log('='.repeat(50))

  try {
    // 1. Scraper les données
    const scrapedData = await scrapeWithFetch(url)

    console.log('\n📋 Données extraites:')
    console.log(`   Nom: ${scrapedData.username}`)
    console.log(`   Âge: ${scrapedData.age} ans`)
    console.log(`   Ville: ${scrapedData.location}`)
    console.log(`   Téléphone: ${scrapedData.phone || 'Non trouvé'}`)
    console.log(`   WhatsApp: ${scrapedData.hasWhatsapp ? 'Oui' : 'Non'}`)
    console.log(`   Taille: ${scrapedData.height} cm`)
    console.log(`   Poids: ${scrapedData.weight} kg`)
    console.log(`   Mensurations: ${scrapedData.measurements}`)
    console.log(`   Prix: ${scrapedData.price}€`)
    console.log(`   Incall: ${scrapedData.incall ? 'Oui' : 'Non'}`)
    console.log(`   Outcall: ${scrapedData.outcall ? 'Oui' : 'Non'}`)

    // 2. Description vide (l'utilisateur l'ajoutera manuellement)
    scrapedData.description = ''

    // 3. Trouver le prochain numéro d'email
    const nextNumber = await getNextEmailNumber()
    const email = `${EMAIL_PREFIX}${nextNumber}${EMAIL_DOMAIN}`

    console.log(`\n📊 Prochain email disponible: ${email}`)

    // 4. Créer le compte
    const user = await createAccount(email)

    // 5. Mettre à jour le profil
    await updateProfile(user.id, email, scrapedData)

    // 6. Créer l'annonce avec le lien source
    const ad = await createAd(user.id, scrapedData, url)

    console.log('\n' + '='.repeat(50))
    console.log('✅ IMPORT TERMINÉ!')
    console.log('='.repeat(50))
    console.log(`   📧 Email: ${email}`)
    console.log(`   🔑 Mot de passe: ${PASSWORD}`)
    console.log(`   👤 User ID: ${user.id}`)
    console.log(`   📝 Ad ID: ${ad.id}`)
    console.log(`   🔗 URL: https://www.sexelite.eu/ads/${ad.id}`)
    console.log(`   📎 Source: ${url}`)
    console.log('\n⚠️ N\'oublie pas d\'ajouter les photos manuellement!')

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message)
    process.exit(1)
  }
}

main()
