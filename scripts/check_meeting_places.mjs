import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nzrptauexzttqhmnhhgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzQ4NTUsImV4cCI6MjA1ODQxMDg1NX0.lW0EVJUjTCPfkTIWQ6wMiJn4l3JDvXGmBTZJ2QjGXrk'
)

async function checkMeetingPlaces() {
  try {
    console.log('🔍 Vérification des lieux de rendez-vous dans Sliema...\n')

    // Récupérer quelques annonces de Sliema
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, city, meeting_at_home, meeting_at_hotel, meeting_in_car, meeting_at_escort')
      .eq('city', 'Sliema')
      .limit(10)

    if (error) {
      console.error('❌ Erreur:', error)
      return
    }

    console.log(`📊 Trouvé ${ads.length} annonces\n`)

    ads.forEach((ad, index) => {
      console.log(`Annonce ${index + 1}:`)
      console.log(`  meeting_at_home: ${ad.meeting_at_home} (Outcall - se déplace)`)
      console.log(`  meeting_at_hotel: ${ad.meeting_at_hotel}`)
      console.log(`  meeting_in_car: ${ad.meeting_in_car}`)
      console.log(`  meeting_at_escort: ${ad.meeting_at_escort} (Incall - reçoit)`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkMeetingPlaces()
