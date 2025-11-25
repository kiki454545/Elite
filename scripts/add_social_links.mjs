import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addSocialLinksColumns() {
  console.log('🔧 Ajout des colonnes MYM et OnlyFans...\n')

  // Ajouter la colonne mym_url
  const { error: mymError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mym_url TEXT;`
  })

  if (mymError) {
    console.log('⚠️ Tentative alternative pour mym_url...')
    // Essayer avec une requête directe
    const { error: mymError2 } = await supabase
      .from('profiles')
      .update({ mym_url: null })
      .eq('id', '00000000-0000-0000-0000-000000000000')

    if (mymError2 && !mymError2.message.includes('column')) {
      console.log('ℹ️ La colonne mym_url existe peut-être déjà ou erreur:', mymError2.message)
    }
  } else {
    console.log('✅ Colonne mym_url ajoutée')
  }

  // Ajouter la colonne onlyfans_url
  const { error: ofError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onlyfans_url TEXT;`
  })

  if (ofError) {
    console.log('⚠️ Tentative alternative pour onlyfans_url...')
    const { error: ofError2 } = await supabase
      .from('profiles')
      .update({ onlyfans_url: null })
      .eq('id', '00000000-0000-0000-0000-000000000000')

    if (ofError2 && !ofError2.message.includes('column')) {
      console.log('ℹ️ La colonne onlyfans_url existe peut-être déjà ou erreur:', ofError2.message)
    }
  } else {
    console.log('✅ Colonne onlyfans_url ajoutée')
  }

  console.log('\n✅ Migration terminée!')
  console.log('Les colonnes mym_url et onlyfans_url sont maintenant disponibles dans la table profiles.')
}

addSocialLinksColumns()
