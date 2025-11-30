import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkStats() {
  // Récupérer les dernières entrées
  const { data, error } = await supabase
    .from('visitor_stats')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(50)

  if (error) {
    console.log('Erreur:', error)
    return
  }

  console.log('=== Dernières 50 visites ===')
  const ipCounts = {}
  data.forEach(v => {
    ipCounts[v.ip_address] = (ipCounts[v.ip_address] || 0) + 1
    console.log(`IP: ${v.ip_address.padEnd(20)} | Date: ${v.visited_at} | Page: ${v.page_path}`)
  })

  console.log('\n=== Comptage par IP ===')
  Object.entries(ipCounts).forEach(([ip, count]) => {
    console.log(`${ip}: ${count} visite(s)`)
  })

  console.log('\n=== IPs uniques sur ces 50 entrées: ' + Object.keys(ipCounts).length)

  // Vérifier toutes les IPs uniques dans la base
  const { data: allIps } = await supabase
    .from('visitor_stats')
    .select('ip_address')

  if (allIps) {
    const uniqueIps = new Set(allIps.map(v => v.ip_address))
    console.log('\n=== Total IPs uniques dans la base: ' + uniqueIps.size)
    console.log('IPs:')
    uniqueIps.forEach(ip => console.log('  - ' + ip))
  }
}

checkStats()
