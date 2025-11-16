import * as fs from 'fs'

console.log('🔧 Correction de la fonction search_ads_by_distance...\n')

const sqlContent = fs.readFileSync('scripts/fix_geolocation_function.sql', 'utf8')

console.log('⚠️  ATTENTION: Cette correction doit être exécutée depuis le tableau de bord Supabase\n')
console.log('📋 Étapes à suivre:\n')
console.log('   1. Allez sur https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor/sql')
console.log('   2. Créez une nouvelle requête SQL')
console.log('   3. Copiez-collez le contenu ci-dessous:')
console.log('\n═══════════════════════════════════════════════════════')
console.log(sqlContent)
console.log('═══════════════════════════════════════════════════════\n')
console.log('   4. Exécutez la requête\n')
console.log('💡 Cette correction remplace la fonction search_ads_by_distance avec les bonnes colonnes')
