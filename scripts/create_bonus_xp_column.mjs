import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBonusXPColumn() {
  console.log('🔧 Création de la colonne bonus_xp...\n')

  // Vérifier si la colonne existe déjà en essayant de lire un profil
  const { data: testProfile, error: testError } = await supabase
    .from('profiles')
    .select('id, bonus_xp')
    .limit(1)

  if (!testError) {
    console.log('✅ La colonne bonus_xp existe déjà!')
    return true
  }

  console.log('❌ La colonne bonus_xp n\'existe pas')
  console.log('\n📋 Veuillez créer la colonne manuellement dans Supabase:')
  console.log('   1. Allez sur https://supabase.com/dashboard')
  console.log('   2. Sélectionnez votre projet')
  console.log('   3. Table Editor > profiles')
  console.log('   4. Cliquez sur "+" pour ajouter une colonne')
  console.log('   5. Nom: bonus_xp')
  console.log('   6. Type: int4')
  console.log('   7. Default Value: 0')
  console.log('   8. Sauvegardez')

  console.log('\n🔄 Ou exécutez ce SQL dans l\'éditeur SQL de Supabase:')
  console.log('   ALTER TABLE profiles ADD COLUMN bonus_xp INTEGER DEFAULT 0;')

  return false
}

createBonusXPColumn()
