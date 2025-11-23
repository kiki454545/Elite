import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdsLocations() {
  // Récupérer toutes les annonces
  const { data: ads, error } = await supabase
    .from('ads')
    .select('location, country, latitude, longitude');

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log('Total annonces:', ads.length);
  console.log('\n=== Villes utilisées dans les annonces ===\n');

  // Grouper par pays
  const locationsByCountry = {};
  const uniqueCities = new Map();

  ads.forEach(ad => {
    const country = ad.country || 'MT';
    const location = ad.location || 'unknown';

    if (!locationsByCountry[country]) {
      locationsByCountry[country] = new Set();
    }
    locationsByCountry[country].add(location);

    const key = `${location}|${country}`;
    if (!uniqueCities.has(key)) {
      uniqueCities.set(key, {
        city: location,
        country,
        lat: ad.latitude,
        lon: ad.longitude
      });
    }
  });

  console.log('Villes par pays:');
  Object.entries(locationsByCountry).forEach(([country, cities]) => {
    const cityList = [...cities].slice(0, 15).join(', ');
    console.log(`  ${country}: ${cities.size} villes - [${cityList}]`);
  });

  console.log('\n=== Toutes les villes uniques avec coordonnées ===\n');
  const citiesArray = [...uniqueCities.values()];
  citiesArray.forEach(city => {
    if (city.lat && city.lon) {
      console.log(`  - ${city.city} (${city.country}) [lat: ${city.lat}, lon: ${city.lon}]`);
    } else {
      console.log(`  - ${city.city} (${city.country}) [PAS DE COORDONNÉES]`);
    }
  });

  console.log(`\n\nTotal: ${citiesArray.length} villes uniques à ajouter`);
}

checkAdsLocations();
