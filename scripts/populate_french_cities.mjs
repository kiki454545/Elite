import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Fonction pour normaliser le nom de ville (sans accents, minuscules)
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Liste des principales villes françaises avec coordonnées GPS
// Source: données publiques de l'INSEE et OpenStreetMap
const frenchCities = [
  // Île-de-France
  { name: 'Paris', department: 'Paris', department_code: '75', latitude: 48.8566, longitude: 2.3522, population: 2165423 },
  { name: 'Boulogne-Billancourt', department: 'Hauts-de-Seine', department_code: '92', latitude: 48.8353, longitude: 2.2400, population: 120071 },
  { name: 'Saint-Denis', department: 'Seine-Saint-Denis', department_code: '93', latitude: 48.9356, longitude: 2.3539, population: 111135 },
  { name: 'Argenteuil', department: 'Val-d\'Oise', department_code: '95', latitude: 48.9479, longitude: 2.2467, population: 110210 },
  { name: 'Montreuil', department: 'Seine-Saint-Denis', department_code: '93', latitude: 48.8626, longitude: 2.4417, population: 109914 },
  { name: 'Versailles', department: 'Yvelines', department_code: '78', latitude: 48.8048, longitude: 2.1203, population: 85771 },
  { name: 'Nanterre', department: 'Hauts-de-Seine', department_code: '92', latitude: 48.8922, longitude: 2.2069, population: 96277 },
  { name: 'Créteil', department: 'Val-de-Marne', department_code: '94', latitude: 48.7900, longitude: 2.4553, population: 92265 },

  // Provence-Alpes-Côte d'Azur
  { name: 'Marseille', department: 'Bouches-du-Rhône', department_code: '13', latitude: 43.2965, longitude: 5.3698, population: 870731 },
  { name: 'Nice', department: 'Alpes-Maritimes', department_code: '06', latitude: 43.7102, longitude: 7.2620, population: 340017 },
  { name: 'Toulon', department: 'Var', department_code: '83', latitude: 43.1242, longitude: 5.9280, population: 176198 },
  { name: 'Aix-en-Provence', department: 'Bouches-du-Rhône', department_code: '13', latitude: 43.5297, longitude: 5.4474, population: 145721 },
  { name: 'Cannes', department: 'Alpes-Maritimes', department_code: '06', latitude: 43.5528, longitude: 7.0174, population: 74152 },
  { name: 'Antibes', department: 'Alpes-Maritimes', department_code: '06', latitude: 43.5808, longitude: 7.1251, population: 76393 },

  // Auvergne-Rhône-Alpes
  { name: 'Lyon', department: 'Rhône', department_code: '69', latitude: 45.7640, longitude: 4.8357, population: 522228 },
  { name: 'Grenoble', department: 'Isère', department_code: '38', latitude: 45.1885, longitude: 5.7245, population: 158454 },
  { name: 'Saint-Étienne', department: 'Loire', department_code: '42', latitude: 45.4397, longitude: 4.3872, population: 171057 },
  { name: 'Villeurbanne', department: 'Rhône', department_code: '69', latitude: 45.7667, longitude: 4.8797, population: 152042 },
  { name: 'Clermont-Ferrand', department: 'Puy-de-Dôme', department_code: '63', latitude: 45.7772, longitude: 3.0870, population: 144817 },

  // Occitanie
  { name: 'Toulouse', department: 'Haute-Garonne', department_code: '31', latitude: 43.6047, longitude: 1.4442, population: 479553 },
  { name: 'Montpellier', department: 'Hérault', department_code: '34', latitude: 43.6108, longitude: 3.8767, population: 290053 },
  { name: 'Nîmes', department: 'Gard', department_code: '30', latitude: 43.8374, longitude: 4.3601, population: 151001 },
  { name: 'Perpignan', department: 'Pyrénées-Orientales', department_code: '66', latitude: 42.6886, longitude: 2.8948, population: 121934 },

  // Nouvelle-Aquitaine
  { name: 'Bordeaux', department: 'Gironde', department_code: '33', latitude: 44.8378, longitude: -0.5792, population: 254436 },
  { name: 'Limoges', department: 'Haute-Vienne', department_code: '87', latitude: 45.8336, longitude: 1.2611, population: 132175 },
  { name: 'Pau', department: 'Pyrénées-Atlantiques', department_code: '64', latitude: 43.2951, longitude: -0.3708, population: 77215 },
  { name: 'La Rochelle', department: 'Charente-Maritime', department_code: '17', latitude: 46.1603, longitude: -1.1511, population: 77196 },
  { name: 'Poitiers', department: 'Vienne', department_code: '86', latitude: 46.5802, longitude: 0.3404, population: 88291 },

  // Hauts-de-France
  { name: 'Lille', department: 'Nord', department_code: '59', latitude: 50.6292, longitude: 3.0573, population: 232787 },
  { name: 'Amiens', department: 'Somme', department_code: '80', latitude: 49.8941, longitude: 2.2957, population: 133625 },
  { name: 'Roubaix', department: 'Nord', department_code: '59', latitude: 50.6942, longitude: 3.1746, population: 98828 },
  { name: 'Tourcoing', department: 'Nord', department_code: '59', latitude: 50.7233, longitude: 3.1614, population: 97476 },
  { name: 'Calais', department: 'Pas-de-Calais', department_code: '62', latitude: 50.9513, longitude: 1.8587, population: 72509 },

  // Bretagne
  { name: 'Rennes', department: 'Ille-et-Vilaine', department_code: '35', latitude: 48.1173, longitude: -1.6778, population: 217728 },
  { name: 'Brest', department: 'Finistère', department_code: '29', latitude: 48.3905, longitude: -4.4861, population: 139384 },
  { name: 'Quimper', department: 'Finistère', department_code: '29', latitude: 47.9960, longitude: -4.0978, population: 63473 },
  { name: 'Lorient', department: 'Morbihan', department_code: '56', latitude: 47.7482, longitude: -3.3661, population: 57662 },
  { name: 'Vannes', department: 'Morbihan', department_code: '56', latitude: 47.6584, longitude: -2.7603, population: 54020 },

  // Pays de la Loire
  { name: 'Nantes', department: 'Loire-Atlantique', department_code: '44', latitude: 47.2184, longitude: -1.5536, population: 309346 },
  { name: 'Angers', department: 'Maine-et-Loire', department_code: '49', latitude: 47.4784, longitude: -0.5632, population: 154508 },
  { name: 'Le Mans', department: 'Sarthe', department_code: '72', latitude: 48.0077, longitude: 0.1984, population: 143813 },
  { name: 'Saint-Nazaire', department: 'Loire-Atlantique', department_code: '44', latitude: 47.2730, longitude: -2.2135, population: 71046 },

  // Grand Est
  { name: 'Strasbourg', department: 'Bas-Rhin', department_code: '67', latitude: 48.5734, longitude: 7.7521, population: 280966 },
  { name: 'Reims', department: 'Marne', department_code: '51', latitude: 49.2583, longitude: 4.0317, population: 182592 },
  { name: 'Metz', department: 'Moselle', department_code: '57', latitude: 49.1193, longitude: 6.1757, population: 117492 },
  { name: 'Mulhouse', department: 'Haut-Rhin', department_code: '68', latitude: 47.7508, longitude: 7.3359, population: 109588 },
  { name: 'Nancy', department: 'Meurthe-et-Moselle', department_code: '54', latitude: 48.6921, longitude: 6.1844, population: 104885 },

  // Normandie
  { name: 'Le Havre', department: 'Seine-Maritime', department_code: '76', latitude: 49.4944, longitude: 0.1079, population: 170147 },
  { name: 'Rouen', department: 'Seine-Maritime', department_code: '76', latitude: 49.4432, longitude: 1.0993, population: 110145 },
  { name: 'Caen', department: 'Calvados', department_code: '14', latitude: 49.1829, longitude: -0.3707, population: 105403 },
  { name: 'Cherbourg-en-Cotentin', department: 'Manche', department_code: '50', latitude: 49.6393, longitude: -1.6163, population: 78582 },

  // Bourgogne-Franche-Comté
  { name: 'Dijon', department: 'Côte-d\'Or', department_code: '21', latitude: 47.3220, longitude: 5.0415, population: 158002 },
  { name: 'Besançon', department: 'Doubs', department_code: '25', latitude: 47.2380, longitude: 6.0243, population: 117691 },

  // Centre-Val de Loire
  { name: 'Tours', department: 'Indre-et-Loire', department_code: '37', latitude: 47.3941, longitude: 0.6848, population: 136565 },
  { name: 'Orléans', department: 'Loiret', department_code: '45', latitude: 47.9029, longitude: 1.9093, population: 116685 },

  // Corse
  { name: 'Ajaccio', department: 'Corse-du-Sud', department_code: '2A', latitude: 41.9267, longitude: 8.7369, population: 70817 },
  { name: 'Bastia', department: 'Haute-Corse', department_code: '2B', latitude: 42.7028, longitude: 9.4503, population: 44121 },
]

console.log('🚀 Peuplement de la table french_cities...\n')
console.log(`📊 ${frenchCities.length} villes à insérer\n`)

async function populateCities() {
  try {
    // Préparer les données avec noms normalisés
    const citiesToInsert = frenchCities.map(city => ({
      ...city,
      name_normalized: normalizeName(city.name)
    }))

    // Insérer les villes par lots de 50
    const batchSize = 50
    let inserted = 0

    for (let i = 0; i < citiesToInsert.length; i += batchSize) {
      const batch = citiesToInsert.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('french_cities')
        .insert(batch)

      if (error) {
        console.error(`❌ Erreur pour le lot ${Math.floor(i / batchSize) + 1}:`, error.message)
      } else {
        inserted += batch.length
        console.log(`✅ Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(citiesToInsert.length / batchSize)} : ${batch.length} villes insérées`)
      }
    }

    console.log(`\n🎉 Terminé ! ${inserted} villes insérées avec succès !`)

    // Vérification
    const { count } = await supabase
      .from('french_cities')
      .select('*', { count: 'exact', head: true })

    console.log(`📍 Total de villes dans la base : ${count}`)

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message)
  }
}

populateCities()
