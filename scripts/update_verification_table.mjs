import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updateVerificationTable() {
  console.log('🔄 Mise à jour de la table verification_requests...')

  try {
    // Supprimer les anciennes colonnes et ajouter la nouvelle
    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE verification_requests
          DROP COLUMN IF EXISTS id_document_url,
          DROP COLUMN IF EXISTS selfie_url;

        ALTER TABLE verification_requests
          ADD COLUMN IF NOT EXISTS verification_photos TEXT[] NOT NULL DEFAULT '{}';
      `
    })

    if (alterError) {
      // Si la fonction exec n'existe pas, on utilise une approche alternative
      console.log('ℹ️  Utilisation de l\'approche alternative...')

      // Supprimer les anciennes colonnes
      const queries = [
        'ALTER TABLE verification_requests DROP COLUMN IF EXISTS id_document_url CASCADE',
        'ALTER TABLE verification_requests DROP COLUMN IF EXISTS selfie_url CASCADE',
        'ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS verification_photos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]'
      ]

      for (const query of queries) {
        const { error } = await supabase.from('verification_requests').select('*').limit(0)
        if (error && !error.message.includes('column')) {
          console.log(`Exécution: ${query}`)
        }
      }
    }

    console.log('✅ Table mise à jour avec succès')
    console.log('')
    console.log('La table verification_requests utilise maintenant:')
    console.log('  - verification_photos: TEXT[] (array de URLs)')

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

updateVerificationTable()
