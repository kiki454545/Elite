import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { Client } = pg

// Construction de l'URL de connexion à partir des variables d'environnement
const connectionString = 'postgresql://postgres.vqefbhvrrqbkkkiabqay:Youssef12*@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'

async function fixVerificationTable() {
  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('✅ Connecté à la base de données')

    // Supprimer les anciennes colonnes
    console.log('🔄 Suppression des anciennes colonnes...')
    await client.query(`
      ALTER TABLE verification_requests
        DROP COLUMN IF EXISTS id_document_url CASCADE,
        DROP COLUMN IF EXISTS selfie_url CASCADE;
    `)

    // Ajouter la nouvelle colonne
    console.log('➕ Ajout de la colonne verification_photos...')
    await client.query(`
      ALTER TABLE verification_requests
        ADD COLUMN IF NOT EXISTS verification_photos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
    `)

    console.log('✅ Table mise à jour avec succès!')
    console.log('')
    console.log('Structure actuelle de verification_requests:')
    console.log('  - id: UUID')
    console.log('  - user_id: UUID')
    console.log('  - verification_photos: TEXT[] (array de URLs)')
    console.log('  - status: TEXT (pending/approved/rejected)')
    console.log('  - rejection_reason: TEXT')
    console.log('  - admin_id: UUID')
    console.log('  - created_at: TIMESTAMP')
    console.log('  - reviewed_at: TIMESTAMP')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

fixVerificationTable()
