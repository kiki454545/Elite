import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nzrptauexzttqhmnhhgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzQ4NTUsImV4cCI6MjA1ODQxMDg1NX0.lW0EVJUjTCPfkTIWQ6wMiJn4l3JDvXGmBTZJ2QjGXrk'
)

async function checkSliemaGenders() {
  try {
    console.log('🔍 Vérification des genres pour les annonces de Sliema...\n')

    // Récupérer toutes les annonces de Sliema
    const { data: ads, error: adsError } = await supabase
      .from('ads')
      .select('id, user_id, city, gender')
      .eq('city', 'Sliema')

    if (adsError) {
      console.error('❌ Erreur lors de la récupération des annonces:', adsError)
      return
    }

    console.log(`📊 Nombre total d'annonces à Sliema: ${ads.length}\n`)

    // Récupérer les profils correspondants
    const userIds = ads.map(ad => ad.user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, gender')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError)
      return
    }

    // Compter les genres
    const genderCounts = {}
    profiles.forEach(profile => {
      const gender = profile.gender || 'NULL'
      genderCounts[gender] = (genderCounts[gender] || 0) + 1
    })

    console.log('📈 Répartition des genres dans profiles:')
    Object.entries(genderCounts).forEach(([gender, count]) => {
      console.log(`   ${gender}: ${count}`)
    })

    console.log('\n🔍 Détails des profils:')
    profiles.slice(0, 10).forEach(profile => {
      console.log(`   ID: ${profile.id.substring(0, 8)}... | Username: ${profile.username} | Gender: ${profile.gender || 'NULL'}`)
    })

    // Vérifier aussi la colonne gender dans ads
    console.log('\n🔍 Vérification de la colonne gender dans ads:')
    const adsGenderCounts = {}
    ads.forEach(ad => {
      const gender = ad.gender || 'NULL'
      adsGenderCounts[gender] = (adsGenderCounts[gender] || 0) + 1
    })

    console.log('📈 Répartition des genres dans ads:')
    Object.entries(adsGenderCounts).forEach(([gender, count]) => {
      console.log(`   ${gender}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkSliemaGenders()
