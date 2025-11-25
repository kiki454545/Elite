// Script pour migrer les numéros de téléphone de profiles vers ads
// Exécuter avec: node scripts/migrate_phone_numbers.mjs

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.log('Vérifiez que .env.local contient NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('📡 Connexion à:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migratePhoneNumbers() {
  console.log('🔄 Début de la migration des numéros de téléphone...\n')

  // 1. Récupérer tous les profils qui ont un numéro de téléphone
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, phone_number, has_whatsapp, contact_email, mym_url, onlyfans_url')
    .not('phone_number', 'is', null)

  if (profilesError) {
    console.error('❌ Erreur lors de la récupération des profils:', profilesError)
    return
  }

  console.log(`📋 ${profiles.length} profils avec numéro de téléphone trouvés\n`)

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const profile of profiles) {
    console.log(`\n👤 Traitement de ${profile.username || profile.id}...`)
    console.log(`   📞 Téléphone: ${profile.phone_number}`)

    // 2. Trouver toutes les annonces de cet utilisateur
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('id, title, phone_number')
      .eq('user_id', profile.id)

    if (adsError) {
      console.error(`   ❌ Erreur récupération annonces:`, adsError)
      errors++
      continue
    }

    if (!ads || ads.length === 0) {
      console.log(`   ⏭️  Aucune annonce trouvée, ignoré`)
      skipped++
      continue
    }

    console.log(`   📝 ${ads.length} annonce(s) trouvée(s)`)

    // 3. Mettre à jour chaque annonce avec les infos de contact du profil
    for (const ad of ads) {
      // Ne pas écraser si l'annonce a déjà un numéro
      if (ad.phone_number) {
        console.log(`   ✓ Annonce "${ad.title}" a déjà un numéro, ignoré`)
        continue
      }

      const { error: updateError } = await supabase
        .from('ads')
        .update({
          phone_number: profile.phone_number,
          has_whatsapp: profile.has_whatsapp || false,
          contact_email: profile.contact_email || null,
          mym_url: profile.mym_url || null,
          onlyfans_url: profile.onlyfans_url || null
        })
        .eq('id', ad.id)

      if (updateError) {
        console.error(`   ❌ Erreur mise à jour annonce ${ad.id}:`, updateError)
        errors++
      } else {
        console.log(`   ✅ Annonce "${ad.title}" mise à jour`)
        updated++
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ DE LA MIGRATION')
  console.log('='.repeat(50))
  console.log(`✅ Annonces mises à jour: ${updated}`)
  console.log(`⏭️  Profils sans annonce: ${skipped}`)
  console.log(`❌ Erreurs: ${errors}`)
  console.log('='.repeat(50))
}

migratePhoneNumbers()
