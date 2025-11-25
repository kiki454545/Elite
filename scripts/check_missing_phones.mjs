// Script pour vérifier les annonces sans numéro de téléphone

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMissingPhones() {
  console.log('🔍 Vérification des annonces sans numéro de téléphone...\n')

  // 1. Total des annonces
  const { count: totalAds } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Total des annonces: ${totalAds}`)

  // 2. Annonces avec numéro
  const { count: adsWithPhone } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
    .not('phone_number', 'is', null)

  console.log(`✅ Annonces avec numéro: ${adsWithPhone}`)

  // 3. Annonces sans numéro
  const { data: adsWithoutPhone, error } = await supabase
    .from('ads')
    .select('id, title, user_id')
    .is('phone_number', null)

  console.log(`❌ Annonces sans numéro: ${adsWithoutPhone?.length || 0}`)

  if (adsWithoutPhone && adsWithoutPhone.length > 0) {
    console.log('\n📋 Liste des annonces sans numéro:')

    for (const ad of adsWithoutPhone) {
      // Vérifier si le profil a un numéro
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, phone_number')
        .eq('id', ad.user_id)
        .single()

      const hasProfilePhone = profile?.phone_number ? '✅ Profil a un numéro' : '❌ Profil sans numéro'
      console.log(`   - "${ad.title}" (${profile?.username || 'Anonyme'}) - ${hasProfilePhone}`)
    }
  }
}

checkMissingPhones()
