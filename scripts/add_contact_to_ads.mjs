import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fkbwpgfffwgpmzdoojms.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYndwZ2ZmZndncG16ZG9vam1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQxNTI1MSwiZXhwIjoyMDYyOTkxMjUxfQ.yz82r4FvlvhSN_dBOFj-eZ-3de8P1BA7Nca3CdaGhpA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addContactColumnsToAds() {
  console.log('🚀 Ajout des colonnes contact à la table ads...')

  // Liste des colonnes à ajouter
  const columns = [
    { name: 'phone_number', type: 'TEXT' },
    { name: 'has_whatsapp', type: 'BOOLEAN DEFAULT false' },
    { name: 'has_telegram', type: 'BOOLEAN DEFAULT false' },
    { name: 'accepts_sms', type: 'BOOLEAN DEFAULT false' },
    { name: 'accepts_calls', type: 'BOOLEAN DEFAULT false' },
    { name: 'contact_email', type: 'TEXT' },
    { name: 'mym_url', type: 'TEXT' },
    { name: 'onlyfans_url', type: 'TEXT' },
    { name: 'available24_7', type: 'BOOLEAN DEFAULT false' },
    { name: 'availability_days', type: 'TEXT[]' },
    { name: 'availability_hours', type: 'TEXT' },
  ]

  for (const col of columns) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ads ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
      })

      if (error) {
        // Si la fonction RPC n'existe pas, afficher le SQL à exécuter manuellement
        console.log(`⚠️ Impossible d'exécuter automatiquement. Exécutez ce SQL dans Supabase:`)
        console.log(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`)
      } else {
        console.log(`✅ Colonne ${col.name} ajoutée`)
      }
    } catch (err) {
      console.log(`⚠️ ${col.name}: ${err.message}`)
    }
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('📋 SQL à exécuter dans Supabase Dashboard si nécessaire:')
  console.log('='.repeat(60))
  console.log(`
-- Ajout des colonnes contact à la table ads
ALTER TABLE ads ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS has_telegram BOOLEAN DEFAULT false;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS accepts_sms BOOLEAN DEFAULT false;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS accepts_calls BOOLEAN DEFAULT false;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS mym_url TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS onlyfans_url TEXT;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS available24_7 BOOLEAN DEFAULT false;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS availability_days TEXT[];
ALTER TABLE ads ADD COLUMN IF NOT EXISTS availability_hours TEXT;
  `)
}

addContactColumnsToAds()
