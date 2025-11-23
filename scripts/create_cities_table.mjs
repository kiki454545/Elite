import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Villes de Malte avec coordonnées GPS
const maltaCities = [
  { name: 'La Valette', name_normalized: 'la valette', country: 'MT', latitude: 35.8989, longitude: 14.5146, population: 6444 },
  { name: 'St. Julian\'s', name_normalized: 'st julians', country: 'MT', latitude: 35.9175, longitude: 14.4897, population: 13792 },
  { name: 'Sliema', name_normalized: 'sliema', country: 'MT', latitude: 35.9122, longitude: 14.5019, population: 23042 },
  { name: 'Birkirkara', name_normalized: 'birkirkara', country: 'MT', latitude: 35.8972, longitude: 14.4611, population: 24356 },
  { name: 'Msida', name_normalized: 'msida', country: 'MT', latitude: 35.8983, longitude: 14.4853, population: 8820 },
  { name: 'Gzira', name_normalized: 'gzira', country: 'MT', latitude: 35.9064, longitude: 14.4939, population: 7806 },
  { name: 'San Ġwann', name_normalized: 'san gwann', country: 'MT', latitude: 35.9083, longitude: 14.4778, population: 13326 },
  { name: 'Marsaskala', name_normalized: 'marsaskala', country: 'MT', latitude: 35.8619, longitude: 14.5667, population: 13468 },
];

async function createCitiesTable() {
  console.log('🏗️  Vérification de la table cities...\n');

  // Vérifier si la table existe en essayant de lire
  const { error: checkError } = await supabase
    .from('cities')
    .select('id')
    .limit(1);

  if (checkError && checkError.code === 'PGRST204') {
    console.log('⚠️  La table cities n\'existe pas encore.');
    console.log('📝 Veuillez exécuter le fichier scripts/create_cities_table.sql dans Supabase SQL Editor\n');
    return false;
  }

  console.log('✅ Table cities existe\n');
  return true;
}

async function migrateFrenchCities() {
  console.log('🇫🇷 Migration des villes françaises...\n');

  const { data: frenchCities, error: fetchError } = await supabase
    .from('french_cities')
    .select('*');

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des villes françaises:', fetchError);
    return false;
  }

  console.log(`   Trouvé ${frenchCities.length} villes françaises`);

  // Insérer les villes françaises dans la nouvelle table
  const citiesToInsert = frenchCities.map(city => ({
    name: city.name,
    name_normalized: city.name_normalized,
    country: 'FR',
    department: city.department,
    department_code: city.department_code,
    latitude: city.latitude,
    longitude: city.longitude,
    population: city.population
  }));

  const { error: insertError } = await supabase
    .from('cities')
    .insert(citiesToInsert);

  if (insertError) {
    console.error('❌ Erreur lors de l\'insertion des villes françaises:', insertError);
    return false;
  }

  console.log('✅ Villes françaises migrées avec succès\n');
  return true;
}

async function addMaltaCities() {
  console.log('🇲🇹 Ajout des villes maltaises...\n');

  const { error: insertError } = await supabase
    .from('cities')
    .insert(maltaCities);

  if (insertError) {
    console.error('❌ Erreur lors de l\'insertion des villes maltaises:', insertError);
    return false;
  }

  console.log(`✅ ${maltaCities.length} villes maltaises ajoutées avec succès\n`);
  return true;
}

async function main() {
  console.log('===================================');
  console.log('   CRÉATION TABLE CITIES GLOBALE');
  console.log('===================================\n');

  // Étape 1: Créer la table
  const tableCreated = await createCitiesTable();
  if (!tableCreated) {
    console.error('\n❌ Échec de la création de la table');
    process.exit(1);
  }

  // Étape 2: Migrer les villes françaises
  const frenchMigrated = await migrateFrenchCities();
  if (!frenchMigrated) {
    console.error('\n❌ Échec de la migration des villes françaises');
    process.exit(1);
  }

  // Étape 3: Ajouter les villes maltaises
  const maltaAdded = await addMaltaCities();
  if (!maltaAdded) {
    console.error('\n❌ Échec de l\'ajout des villes maltaises');
    process.exit(1);
  }

  // Vérifier le résultat
  const { count, error: countError } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Erreur lors du comptage:', countError);
  } else {
    console.log('===================================');
    console.log(`✨ Migration terminée avec succès!`);
    console.log(`📊 Total de ${count} villes dans la base`);
    console.log('===================================\n');
  }
}

main();
