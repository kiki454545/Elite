import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nzrptauexzttqhmnhhgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzQ4NTUsImV4cCI6MjA1ODQxMDg1NX0.lW0EVJUjTCPfkTIWQ6wMiJn4l3JDvXGmBTZJ2QjGXrk'
)

async function checkPubicHairValues() {
  try {
    console.log('🔍 Vérification des valeurs pubic_hair...\n')

    // Récupérer toutes les valeurs uniques de pubic_hair dans les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, pubic_hair')
      .not('pubic_hair', 'is', null)
      .limit(20)

    if (profilesError) {
      console.error('❌ Erreur profiles:', profilesError)
      return
    }

    console.log(`📊 Trouvé ${profiles.length} profils avec pubic_hair défini\n`)

    // Grouper par valeur
    const valueGroups = {}
    profiles.forEach(profile => {
      const value = profile.pubic_hair
      if (!valueGroups[value]) {
        valueGroups[value] = []
      }
      valueGroups[value].push(profile.username || profile.id.substring(0, 8))
    })

    console.log('📈 Valeurs trouvées:')
    Object.entries(valueGroups).forEach(([value, users]) => {
      console.log(`  "${value}": ${users.length} profil(s)`)
      console.log(`    Exemples: ${users.slice(0, 3).join(', ')}`)
    })

    // Vérifier spécifiquement pour "shaved"
    const { data: shavedProfiles, error: shavedError } = await supabase
      .from('profiles')
      .select('id, username, pubic_hair')
      .eq('pubic_hair', 'shaved')

    if (!shavedError) {
      console.log(`\n✅ Profils avec pubic_hair = "shaved": ${shavedProfiles?.length || 0}`)
      if (shavedProfiles && shavedProfiles.length > 0) {
        shavedProfiles.slice(0, 5).forEach(p => {
          console.log(`   - ${p.username || p.id.substring(0, 8)}: "${p.pubic_hair}"`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkPubicHairValues()
