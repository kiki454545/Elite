import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nzrptauexzttqhmnhhgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzQ4NTUsImV4cCI6MjA1ODQxMDg1NX0.lW0EVJUjTCPfkTIWQ6wMiJn4l3JDvXGmBTZJ2QjGXrk'
)

async function fixTasSliema() {
  try {
    console.log('🔍 Recherche des annonces avec "Tas-Sliema"...\n')

    // Chercher les annonces avec "Tas-Sliema"
    const { data: ads, error: searchError } = await supabase
      .from('ads')
      .select('id, city, user_id')
      .eq('city', 'Tas-Sliema')

    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError)
      return
    }

    console.log(`📊 Trouvé ${ads.length} annonce(s) avec "Tas-Sliema"\n`)

    if (ads.length === 0) {
      console.log('✅ Aucune annonce à modifier')
      return
    }

    // Mettre à jour toutes les annonces vers "Sliema"
    const { data: updated, error: updateError } = await supabase
      .from('ads')
      .update({ city: 'Sliema' })
      .eq('city', 'Tas-Sliema')
      .select()

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError)
      return
    }

    console.log(`✅ ${updated.length} annonce(s) mise(s) à jour vers "Sliema"`)

    // Afficher les détails
    updated.forEach((ad, index) => {
      console.log(`   ${index + 1}. ID: ${ad.id.substring(0, 8)}... → Sliema`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

fixTasSliema()
