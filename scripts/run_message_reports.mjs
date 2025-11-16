import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI3MDYwNiwiZXhwIjoyMDUxODQ2NjA2fQ.9kZDTGfUC8taqQ9Mw29t0cWR-j22_jVITRxOCWwO-CY'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 Exécution de la migration pour les signalements de messages...\n')

const sqlContent = fs.readFileSync('scripts/add_message_reports.sql', 'utf8')

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent })

  if (error) {
    console.error('❌ Erreur lors de l\'exécution:', error.message)
    console.log('\n⚠️  ATTENTION: Cette migration doit être exécutée depuis le tableau de bord Supabase')
    console.log('   Car elle contient des commandes DDL (CREATE INDEX, COMMENT)\n')
    console.log('📋 Étapes à suivre:')
    console.log('   1. Allez sur https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor/sql')
    console.log('   2. Créez une nouvelle requête SQL')
    console.log('   3. Copiez-collez le contenu ci-dessous:')
    console.log('\n═══════════════════════════════════════════════════════')
    console.log(sqlContent)
    console.log('═══════════════════════════════════════════════════════\n')
    console.log('   4. Exécutez la requête')
  } else {
    console.log('✅ Migration exécutée avec succès!')
  }
} catch (error) {
  console.error('❌ Erreur:', error.message)
  console.log('\n⚠️  Veuillez exécuter ce script manuellement depuis le tableau de bord Supabase')
}
