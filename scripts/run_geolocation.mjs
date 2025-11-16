import * as fs from 'fs'

console.log('🚀 Exécution de la migration pour la géolocalisation...\n')

const sqlContent = fs.readFileSync('scripts/create_geolocation.sql', 'utf8')

console.log('⚠️  ATTENTION: Cette migration doit être exécutée depuis le tableau de bord Supabase\n')
console.log('📋 Étapes à suivre:\n')
console.log('   1. Allez sur https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor/sql')
console.log('   2. Créez une nouvelle requête SQL')
console.log('   3. Copiez-collez le contenu ci-dessous:')
console.log('\n═══════════════════════════════════════════════════════')
console.log(sqlContent)
console.log('═══════════════════════════════════════════════════════\n')
console.log('   4. Exécutez la requête\n')
console.log('   5. Puis exécutez : node scripts/populate_french_cities.mjs')
console.log('   6. Enfin : node scripts/migrate_ads_coordinates.mjs\n')
