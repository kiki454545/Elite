export interface CityData {
  name: string
  slug: string
  country: 'FR' | 'BE' | 'CH'
  region?: string
  keywords: string[]
}

export const CITY_SEO_DATA: Record<string, CityData> = {
  // ============================================
  // FRANCE - Grandes villes
  // ============================================
  'paris': {
    name: 'Paris',
    slug: 'paris',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Paris 75', 'escort girl Parisienne', 'escort Champs-Élysées',
      'escort Paris 8', 'escort Paris 16', 'escort Paris 17',
      'escort Pigalle', 'escort Montmartre', 'escort Saint-Germain',
      'escort Marais Paris', 'escort Paris centre', 'escort Paris luxe',
      'escort asiatique Paris', 'escort russe Paris', 'escort brésilienne Paris'
    ]
  },
  'lyon': {
    name: 'Lyon',
    slug: 'lyon',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Lyon 69', 'escort girl Lyonnaise', 'escort Part-Dieu',
      'escort Bellecour', 'escort Lyon 6', 'escort Lyon 3',
      'escort Presqu\'île Lyon', 'escort Villeurbanne', 'escort Rhône'
    ]
  },
  'marseille': {
    name: 'Marseille',
    slug: 'marseille',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Marseille 13', 'escort girl Marseillaise', 'escort Vieux-Port',
      'escort Prado Marseille', 'escort Marseille 8', 'escort Bouches-du-Rhône',
      'escort Aix-en-Provence', 'escort PACA', 'escort Provence'
    ]
  },
  'nice': {
    name: 'Nice',
    slug: 'nice',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Nice 06', 'escort girl Niçoise', 'escort Promenade des Anglais',
      'escort Nice centre', 'escort Côte d\'Azur', 'escort Alpes-Maritimes',
      'escort Cannes', 'escort Monaco', 'escort French Riviera'
    ]
  },
  'toulouse': {
    name: 'Toulouse',
    slug: 'toulouse',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Toulouse 31', 'escort girl Toulousaine', 'escort Capitole',
      'escort Toulouse centre', 'escort Haute-Garonne', 'escort ville rose',
      'escort Blagnac', 'escort Occitanie'
    ]
  },
  'bordeaux': {
    name: 'Bordeaux',
    slug: 'bordeaux',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Bordeaux 33', 'escort girl Bordelaise', 'escort Quinconces',
      'escort Bordeaux centre', 'escort Gironde', 'escort Mérignac',
      'escort Nouvelle-Aquitaine', 'escort Chartrons'
    ]
  },
  'nantes': {
    name: 'Nantes',
    slug: 'nantes',
    country: 'FR',
    region: 'Pays de la Loire',
    keywords: [
      'escort Nantes 44', 'escort girl Nantaise', 'escort Loire-Atlantique',
      'escort Nantes centre', 'escort Pays de la Loire', 'escort Saint-Nazaire'
    ]
  },
  'strasbourg': {
    name: 'Strasbourg',
    slug: 'strasbourg',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Strasbourg 67', 'escort girl Strasbourgeoise', 'escort Bas-Rhin',
      'escort Strasbourg centre', 'escort Alsace', 'escort Grand Est',
      'escort Petite France', 'escort Krutenau'
    ]
  },
  'lille': {
    name: 'Lille',
    slug: 'lille',
    country: 'FR',
    region: 'Hauts-de-France',
    keywords: [
      'escort Lille 59', 'escort girl Lilloise', 'escort Nord',
      'escort Lille centre', 'escort Vieux-Lille', 'escort Hauts-de-France',
      'escort Roubaix', 'escort Tourcoing', 'escort métropole lilloise'
    ]
  },
  'montpellier': {
    name: 'Montpellier',
    slug: 'montpellier',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Montpellier 34', 'escort girl Montpelliéraine', 'escort Hérault',
      'escort Montpellier centre', 'escort Comédie', 'escort Antigone',
      'escort Occitanie', 'escort Languedoc'
    ]
  },
  'rennes': {
    name: 'Rennes',
    slug: 'rennes',
    country: 'FR',
    region: 'Bretagne',
    keywords: [
      'escort Rennes 35', 'escort girl Rennaise', 'escort Ille-et-Vilaine',
      'escort Rennes centre', 'escort Bretagne', 'escort Saint-Malo'
    ]
  },
  'reims': {
    name: 'Reims',
    slug: 'reims',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Reims 51', 'escort girl Rémoise', 'escort Marne',
      'escort Reims centre', 'escort Champagne', 'escort Grand Est'
    ]
  },
  'toulon': {
    name: 'Toulon',
    slug: 'toulon',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Toulon 83', 'escort girl Toulonnaise', 'escort Var',
      'escort Toulon centre', 'escort PACA', 'escort Hyères'
    ]
  },
  'grenoble': {
    name: 'Grenoble',
    slug: 'grenoble',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Grenoble 38', 'escort girl Grenobloise', 'escort Isère',
      'escort Grenoble centre', 'escort Alpes', 'escort Rhône-Alpes'
    ]
  },
  'dijon': {
    name: 'Dijon',
    slug: 'dijon',
    country: 'FR',
    region: 'Bourgogne-Franche-Comté',
    keywords: [
      'escort Dijon 21', 'escort girl Dijonnaise', 'escort Côte-d\'Or',
      'escort Dijon centre', 'escort Bourgogne', 'escort Franche-Comté'
    ]
  },
  'angers': {
    name: 'Angers',
    slug: 'angers',
    country: 'FR',
    region: 'Pays de la Loire',
    keywords: [
      'escort Angers 49', 'escort girl Angevine', 'escort Maine-et-Loire',
      'escort Angers centre', 'escort Pays de la Loire'
    ]
  },
  'saint-etienne': {
    name: 'Saint-Étienne',
    slug: 'saint-etienne',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Saint-Étienne 42', 'escort girl Stéphanoise', 'escort Loire',
      'escort Saint-Étienne centre', 'escort Rhône-Alpes'
    ]
  },
  'le-havre': {
    name: 'Le Havre',
    slug: 'le-havre',
    country: 'FR',
    region: 'Normandie',
    keywords: [
      'escort Le Havre 76', 'escort girl Havraise', 'escort Seine-Maritime',
      'escort Le Havre centre', 'escort Normandie'
    ]
  },
  'clermont-ferrand': {
    name: 'Clermont-Ferrand',
    slug: 'clermont-ferrand',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Clermont-Ferrand 63', 'escort girl Clermontoise', 'escort Puy-de-Dôme',
      'escort Clermont centre', 'escort Auvergne'
    ]
  },
  'tours': {
    name: 'Tours',
    slug: 'tours',
    country: 'FR',
    region: 'Centre-Val de Loire',
    keywords: [
      'escort Tours 37', 'escort girl Tourangelle', 'escort Indre-et-Loire',
      'escort Tours centre', 'escort Centre-Val de Loire', 'escort Touraine'
    ]
  },
  'amiens': {
    name: 'Amiens',
    slug: 'amiens',
    country: 'FR',
    region: 'Hauts-de-France',
    keywords: [
      'escort Amiens 80', 'escort girl Amiénoise', 'escort Somme',
      'escort Amiens centre', 'escort Picardie'
    ]
  },
  'limoges': {
    name: 'Limoges',
    slug: 'limoges',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Limoges 87', 'escort girl Limougeaude', 'escort Haute-Vienne',
      'escort Limoges centre', 'escort Limousin'
    ]
  },
  'metz': {
    name: 'Metz',
    slug: 'metz',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Metz 57', 'escort girl Messine', 'escort Moselle',
      'escort Metz centre', 'escort Lorraine', 'escort Grand Est'
    ]
  },
  'besancon': {
    name: 'Besançon',
    slug: 'besancon',
    country: 'FR',
    region: 'Bourgogne-Franche-Comté',
    keywords: [
      'escort Besançon 25', 'escort girl Bisontine', 'escort Doubs',
      'escort Besançon centre', 'escort Franche-Comté'
    ]
  },
  'perpignan': {
    name: 'Perpignan',
    slug: 'perpignan',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Perpignan 66', 'escort girl Perpignanaise', 'escort Pyrénées-Orientales',
      'escort Perpignan centre', 'escort Catalogne française'
    ]
  },
  'orleans': {
    name: 'Orléans',
    slug: 'orleans',
    country: 'FR',
    region: 'Centre-Val de Loire',
    keywords: [
      'escort Orléans 45', 'escort girl Orléanaise', 'escort Loiret',
      'escort Orléans centre', 'escort Centre-Val de Loire'
    ]
  },
  'rouen': {
    name: 'Rouen',
    slug: 'rouen',
    country: 'FR',
    region: 'Normandie',
    keywords: [
      'escort Rouen 76', 'escort girl Rouennaise', 'escort Seine-Maritime',
      'escort Rouen centre', 'escort Normandie'
    ]
  },
  'caen': {
    name: 'Caen',
    slug: 'caen',
    country: 'FR',
    region: 'Normandie',
    keywords: [
      'escort Caen 14', 'escort girl Caennaise', 'escort Calvados',
      'escort Caen centre', 'escort Normandie', 'escort Basse-Normandie'
    ]
  },
  'mulhouse': {
    name: 'Mulhouse',
    slug: 'mulhouse',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Mulhouse 68', 'escort girl Mulhousienne', 'escort Haut-Rhin',
      'escort Mulhouse centre', 'escort Alsace'
    ]
  },
  'nancy': {
    name: 'Nancy',
    slug: 'nancy',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Nancy 54', 'escort girl Nancéienne', 'escort Meurthe-et-Moselle',
      'escort Nancy centre', 'escort Lorraine', 'escort Place Stanislas'
    ]
  },
  'brest': {
    name: 'Brest',
    slug: 'brest',
    country: 'FR',
    region: 'Bretagne',
    keywords: [
      'escort Brest 29', 'escort girl Brestoise', 'escort Finistère',
      'escort Brest centre', 'escort Bretagne'
    ]
  },
  'argenteuil': {
    name: 'Argenteuil',
    slug: 'argenteuil',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Argenteuil 95', 'escort Val-d\'Oise', 'escort banlieue Paris'
    ]
  },
  'montreuil': {
    name: 'Montreuil',
    slug: 'montreuil',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Montreuil 93', 'escort Seine-Saint-Denis', 'escort Est parisien'
    ]
  },
  'saint-denis': {
    name: 'Saint-Denis',
    slug: 'saint-denis',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Saint-Denis 93', 'escort Seine-Saint-Denis', 'escort Nord Paris'
    ]
  },
  'boulogne-billancourt': {
    name: 'Boulogne-Billancourt',
    slug: 'boulogne-billancourt',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Boulogne 92', 'escort Hauts-de-Seine', 'escort Ouest parisien'
    ]
  },
  'versailles': {
    name: 'Versailles',
    slug: 'versailles',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Versailles 78', 'escort Yvelines', 'escort château de Versailles'
    ]
  },
  'nanterre': {
    name: 'Nanterre',
    slug: 'nanterre',
    country: 'FR',
    region: 'Île-de-France',
    keywords: [
      'escort Nanterre 92', 'escort La Défense', 'escort Hauts-de-Seine'
    ]
  },
  'cannes': {
    name: 'Cannes',
    slug: 'cannes',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Cannes 06', 'escort girl Cannoise', 'escort Croisette',
      'escort Festival de Cannes', 'escort Côte d\'Azur luxe', 'escort Palm Beach'
    ]
  },
  'antibes': {
    name: 'Antibes',
    slug: 'antibes',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Antibes 06', 'escort Juan-les-Pins', 'escort Cap d\'Antibes',
      'escort Côte d\'Azur'
    ]
  },
  'aix-en-provence': {
    name: 'Aix-en-Provence',
    slug: 'aix-en-provence',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Aix-en-Provence 13', 'escort girl Aixoise', 'escort Cours Mirabeau',
      'escort Provence', 'escort Bouches-du-Rhône'
    ]
  },

  // ============================================
  // BELGIQUE
  // ============================================
  'bruxelles': {
    name: 'Bruxelles',
    slug: 'bruxelles',
    country: 'BE',
    region: 'Bruxelles-Capitale',
    keywords: [
      'escort Bruxelles', 'escort girl Bruxelloise', 'escort Brussels',
      'escort Ixelles', 'escort Saint-Gilles', 'escort Uccle',
      'escort Grand-Place', 'escort Belgique capitale', 'escort Avenue Louise',
      'escort Schaerbeek', 'escort Etterbeek', 'escort Forest'
    ]
  },
  'anvers': {
    name: 'Anvers',
    slug: 'anvers',
    country: 'BE',
    region: 'Flandre',
    keywords: [
      'escort Anvers', 'escort Antwerpen', 'escort girl Anversoise',
      'escort Flandre', 'escort port Anvers', 'escort diamantaires'
    ]
  },
  'gand': {
    name: 'Gand',
    slug: 'gand',
    country: 'BE',
    region: 'Flandre',
    keywords: [
      'escort Gand', 'escort Gent', 'escort girl Gantoise',
      'escort Flandre orientale', 'escort étudiant Gand'
    ]
  },
  'charleroi': {
    name: 'Charleroi',
    slug: 'charleroi',
    country: 'BE',
    region: 'Wallonie',
    keywords: [
      'escort Charleroi', 'escort girl Carolorégienne', 'escort Hainaut',
      'escort Wallonie', 'escort aéroport Charleroi'
    ]
  },
  'liege': {
    name: 'Liège',
    slug: 'liege',
    country: 'BE',
    region: 'Wallonie',
    keywords: [
      'escort Liège', 'escort girl Liégeoise', 'escort Wallonie',
      'escort Guillemins', 'escort cité ardente', 'escort province Liège'
    ]
  },
  'namur': {
    name: 'Namur',
    slug: 'namur',
    country: 'BE',
    region: 'Wallonie',
    keywords: [
      'escort Namur', 'escort girl Namuroise', 'escort capitale Wallonie',
      'escort citadelle Namur'
    ]
  },
  'mons': {
    name: 'Mons',
    slug: 'mons',
    country: 'BE',
    region: 'Wallonie',
    keywords: [
      'escort Mons', 'escort girl Montoise', 'escort Hainaut',
      'escort Bergen'
    ]
  },
  'bruges': {
    name: 'Bruges',
    slug: 'bruges',
    country: 'BE',
    region: 'Flandre',
    keywords: [
      'escort Bruges', 'escort Brugge', 'escort girl Brugeoise',
      'escort Flandre occidentale', 'escort Venise du Nord'
    ]
  },
  'louvain': {
    name: 'Louvain',
    slug: 'louvain',
    country: 'BE',
    region: 'Flandre',
    keywords: [
      'escort Louvain', 'escort Leuven', 'escort KU Leuven',
      'escort Brabant flamand', 'escort étudiant Louvain'
    ]
  },

  // ============================================
  // SUISSE
  // ============================================
  'geneve': {
    name: 'Genève',
    slug: 'geneve',
    country: 'CH',
    region: 'Genève',
    keywords: [
      'escort Genève', 'escort Geneva', 'escort girl Genevoise',
      'escort lac Léman', 'escort Suisse romande', 'escort ONU Genève',
      'escort Pâquis', 'escort Eaux-Vives', 'escort Carouge',
      'escort luxe Genève', 'escort internationale Genève'
    ]
  },
  'zurich': {
    name: 'Zurich',
    slug: 'zurich',
    country: 'CH',
    region: 'Zurich',
    keywords: [
      'escort Zurich', 'escort Zürich', 'escort girl Zurichoise',
      'escort Suisse alémanique', 'escort Bahnhofstrasse',
      'escort luxe Zurich', 'escort banque Zurich'
    ]
  },
  'lausanne': {
    name: 'Lausanne',
    slug: 'lausanne',
    country: 'CH',
    region: 'Vaud',
    keywords: [
      'escort Lausanne', 'escort girl Lausannoise', 'escort Vaud',
      'escort EPFL', 'escort Ouchy', 'escort Suisse romande',
      'escort lac Léman'
    ]
  },
  'berne': {
    name: 'Berne',
    slug: 'berne',
    country: 'CH',
    region: 'Berne',
    keywords: [
      'escort Berne', 'escort Bern', 'escort capitale Suisse',
      'escort girl Bernoise', 'escort diplomate Berne'
    ]
  },
  'bale': {
    name: 'Bâle',
    slug: 'bale',
    country: 'CH',
    region: 'Bâle-Ville',
    keywords: [
      'escort Bâle', 'escort Basel', 'escort girl Bâloise',
      'escort pharma Bâle', 'escort Art Basel', 'escort frontière'
    ]
  },
  'lucerne': {
    name: 'Lucerne',
    slug: 'lucerne',
    country: 'CH',
    region: 'Lucerne',
    keywords: [
      'escort Lucerne', 'escort Luzern', 'escort Suisse centrale',
      'escort lac des Quatre-Cantons', 'escort tourisme Lucerne'
    ]
  },
  'fribourg': {
    name: 'Fribourg',
    slug: 'fribourg',
    country: 'CH',
    region: 'Fribourg',
    keywords: [
      'escort Fribourg', 'escort Freiburg', 'escort bilingue',
      'escort université Fribourg'
    ]
  },
  'neuchatel': {
    name: 'Neuchâtel',
    slug: 'neuchatel',
    country: 'CH',
    region: 'Neuchâtel',
    keywords: [
      'escort Neuchâtel', 'escort lac Neuchâtel', 'escort horlogerie',
      'escort Suisse romande'
    ]
  },
  'montreux': {
    name: 'Montreux',
    slug: 'montreux',
    country: 'CH',
    region: 'Vaud',
    keywords: [
      'escort Montreux', 'escort Riviera suisse', 'escort Jazz Festival',
      'escort Vevey', 'escort lac Léman luxe'
    ]
  },
  'sion': {
    name: 'Sion',
    slug: 'sion',
    country: 'CH',
    region: 'Valais',
    keywords: [
      'escort Sion', 'escort Valais', 'escort Sitten',
      'escort ski Valais', 'escort montagne'
    ]
  },
  'lugano': {
    name: 'Lugano',
    slug: 'lugano',
    country: 'CH',
    region: 'Tessin',
    keywords: [
      'escort Lugano', 'escort Tessin', 'escort Ticino',
      'escort Suisse italienne', 'escort lac de Lugano'
    ]
  },

  // ============================================
  // FRANCE - Villes moyennes supplémentaires
  // ============================================
  'avignon': {
    name: 'Avignon',
    slug: 'avignon',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Avignon 84', 'escort Vaucluse', 'escort Palais des Papes',
      'escort Festival d\'Avignon', 'escort Provence'
    ]
  },
  'pau': {
    name: 'Pau',
    slug: 'pau',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Pau 64', 'escort Pyrénées-Atlantiques', 'escort Béarn',
      'escort Pays basque'
    ]
  },
  'poitiers': {
    name: 'Poitiers',
    slug: 'poitiers',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Poitiers 86', 'escort Vienne', 'escort Futuroscope',
      'escort Nouvelle-Aquitaine'
    ]
  },
  'la-rochelle': {
    name: 'La Rochelle',
    slug: 'la-rochelle',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort La Rochelle 17', 'escort Charente-Maritime', 'escort Vieux Port',
      'escort île de Ré'
    ]
  },
  'bayonne': {
    name: 'Bayonne',
    slug: 'bayonne',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Bayonne 64', 'escort Pays basque', 'escort Biarritz',
      'escort côte basque'
    ]
  },
  'biarritz': {
    name: 'Biarritz',
    slug: 'biarritz',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Biarritz 64', 'escort luxe Biarritz', 'escort plage Biarritz',
      'escort surf Biarritz', 'escort côte basque'
    ]
  },
  'saint-tropez': {
    name: 'Saint-Tropez',
    slug: 'saint-tropez',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Saint-Tropez 83', 'escort luxe Saint-Tropez', 'escort jet-set',
      'escort Pampelonne', 'escort yacht Saint-Tropez'
    ]
  },
  'chambery': {
    name: 'Chambéry',
    slug: 'chambery',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Chambéry 73', 'escort Savoie', 'escort Alpes',
      'escort ski Savoie'
    ]
  },
  'annecy': {
    name: 'Annecy',
    slug: 'annecy',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Annecy 74', 'escort Haute-Savoie', 'escort lac d\'Annecy',
      'escort Venise des Alpes'
    ]
  },
  'colmar': {
    name: 'Colmar',
    slug: 'colmar',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Colmar 68', 'escort Haut-Rhin', 'escort Alsace',
      'escort petite Venise'
    ]
  },
  'troyes': {
    name: 'Troyes',
    slug: 'troyes',
    country: 'FR',
    region: 'Grand Est',
    keywords: [
      'escort Troyes 10', 'escort Aube', 'escort Champagne',
      'escort magasins d\'usine'
    ]
  },
  'dunkerque': {
    name: 'Dunkerque',
    slug: 'dunkerque',
    country: 'FR',
    region: 'Hauts-de-France',
    keywords: [
      'escort Dunkerque 59', 'escort Nord', 'escort port Dunkerque',
      'escort Côte d\'Opale'
    ]
  },
  'calais': {
    name: 'Calais',
    slug: 'calais',
    country: 'FR',
    region: 'Hauts-de-France',
    keywords: [
      'escort Calais 62', 'escort Pas-de-Calais', 'escort tunnel',
      'escort Côte d\'Opale'
    ]
  },
  'valence': {
    name: 'Valence',
    slug: 'valence',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Valence 26', 'escort Drôme', 'escort Rhône-Alpes',
      'escort vallée du Rhône'
    ]
  },
  'nimes': {
    name: 'Nîmes',
    slug: 'nimes',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Nîmes 30', 'escort Gard', 'escort arènes Nîmes',
      'escort Occitanie', 'escort Camargue'
    ]
  },
  'beziers': {
    name: 'Béziers',
    slug: 'beziers',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Béziers 34', 'escort Hérault', 'escort Languedoc',
      'escort canal du Midi'
    ]
  },
  'carcassonne': {
    name: 'Carcassonne',
    slug: 'carcassonne',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Carcassonne 11', 'escort Aude', 'escort cité médiévale',
      'escort Languedoc'
    ]
  },
  'ajaccio': {
    name: 'Ajaccio',
    slug: 'ajaccio',
    country: 'FR',
    region: 'Corse',
    keywords: [
      'escort Ajaccio', 'escort Corse-du-Sud', 'escort Corse',
      'escort île de beauté'
    ]
  },
  'bastia': {
    name: 'Bastia',
    slug: 'bastia',
    country: 'FR',
    region: 'Corse',
    keywords: [
      'escort Bastia', 'escort Haute-Corse', 'escort Corse',
      'escort Cap Corse'
    ]
  },
  'quimper': {
    name: 'Quimper',
    slug: 'quimper',
    country: 'FR',
    region: 'Bretagne',
    keywords: [
      'escort Quimper 29', 'escort Finistère', 'escort Bretagne',
      'escort Cornouaille'
    ]
  },
  'lorient': {
    name: 'Lorient',
    slug: 'lorient',
    country: 'FR',
    region: 'Bretagne',
    keywords: [
      'escort Lorient 56', 'escort Morbihan', 'escort Bretagne',
      'escort Festival Interceltique'
    ]
  },
  'vannes': {
    name: 'Vannes',
    slug: 'vannes',
    country: 'FR',
    region: 'Bretagne',
    keywords: [
      'escort Vannes 56', 'escort Morbihan', 'escort golfe du Morbihan',
      'escort Bretagne Sud'
    ]
  },
  'saint-brieuc': {
    name: 'Saint-Brieuc',
    slug: 'saint-brieuc',
    country: 'FR',
    region: 'Bretagne',
    keywords: [
      'escort Saint-Brieuc 22', 'escort Côtes-d\'Armor', 'escort Bretagne Nord'
    ]
  },
  'bourges': {
    name: 'Bourges',
    slug: 'bourges',
    country: 'FR',
    region: 'Centre-Val de Loire',
    keywords: [
      'escort Bourges 18', 'escort Cher', 'escort Centre-Val de Loire',
      'escort Printemps de Bourges'
    ]
  },
  'chartres': {
    name: 'Chartres',
    slug: 'chartres',
    country: 'FR',
    region: 'Centre-Val de Loire',
    keywords: [
      'escort Chartres 28', 'escort Eure-et-Loir', 'escort cathédrale',
      'escort Beauce'
    ]
  },
  'blois': {
    name: 'Blois',
    slug: 'blois',
    country: 'FR',
    region: 'Centre-Val de Loire',
    keywords: [
      'escort Blois 41', 'escort Loir-et-Cher', 'escort châteaux de la Loire',
      'escort Val de Loire'
    ]
  },
  'le-mans': {
    name: 'Le Mans',
    slug: 'le-mans',
    country: 'FR',
    region: 'Pays de la Loire',
    keywords: [
      'escort Le Mans 72', 'escort Sarthe', 'escort 24h du Mans',
      'escort Pays de la Loire'
    ]
  },
  'cholet': {
    name: 'Cholet',
    slug: 'cholet',
    country: 'FR',
    region: 'Pays de la Loire',
    keywords: [
      'escort Cholet 49', 'escort Maine-et-Loire', 'escort Mauges'
    ]
  },
  'laval': {
    name: 'Laval',
    slug: 'laval',
    country: 'FR',
    region: 'Pays de la Loire',
    keywords: [
      'escort Laval 53', 'escort Mayenne', 'escort Pays de la Loire'
    ]
  },
  'saint-nazaire': {
    name: 'Saint-Nazaire',
    slug: 'saint-nazaire',
    country: 'FR',
    region: 'Pays de la Loire',
    keywords: [
      'escort Saint-Nazaire 44', 'escort Loire-Atlantique', 'escort chantiers navals',
      'escort estuaire Loire'
    ]
  },
  'niort': {
    name: 'Niort',
    slug: 'niort',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Niort 79', 'escort Deux-Sèvres', 'escort Marais poitevin'
    ]
  },
  'angouleme': {
    name: 'Angoulême',
    slug: 'angouleme',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Angoulême 16', 'escort Charente', 'escort Festival BD',
      'escort Circuit des Remparts'
    ]
  },
  'perigueux': {
    name: 'Périgueux',
    slug: 'perigueux',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Périgueux 24', 'escort Dordogne', 'escort Périgord'
    ]
  },
  'agen': {
    name: 'Agen',
    slug: 'agen',
    country: 'FR',
    region: 'Nouvelle-Aquitaine',
    keywords: [
      'escort Agen 47', 'escort Lot-et-Garonne', 'escort Sud-Ouest'
    ]
  },
  'tarbes': {
    name: 'Tarbes',
    slug: 'tarbes',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Tarbes 65', 'escort Hautes-Pyrénées', 'escort Lourdes',
      'escort Pyrénées'
    ]
  },
  'albi': {
    name: 'Albi',
    slug: 'albi',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Albi 81', 'escort Tarn', 'escort cité épiscopale'
    ]
  },
  'rodez': {
    name: 'Rodez',
    slug: 'rodez',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Rodez 12', 'escort Aveyron', 'escort musée Soulages'
    ]
  },
  'montauban': {
    name: 'Montauban',
    slug: 'montauban',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Montauban 82', 'escort Tarn-et-Garonne', 'escort Occitanie'
    ]
  },
  'auch': {
    name: 'Auch',
    slug: 'auch',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Auch 32', 'escort Gers', 'escort Gascogne'
    ]
  },
  'cahors': {
    name: 'Cahors',
    slug: 'cahors',
    country: 'FR',
    region: 'Occitanie',
    keywords: [
      'escort Cahors 46', 'escort Lot', 'escort Quercy'
    ]
  },
  'gap': {
    name: 'Gap',
    slug: 'gap',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Gap 05', 'escort Hautes-Alpes', 'escort Alpes du Sud'
    ]
  },
  'digne-les-bains': {
    name: 'Digne-les-Bains',
    slug: 'digne-les-bains',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Digne 04', 'escort Alpes-de-Haute-Provence', 'escort thermes'
    ]
  },
  'frejus': {
    name: 'Fréjus',
    slug: 'frejus',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Fréjus 83', 'escort Saint-Raphaël', 'escort Var',
      'escort Côte d\'Azur'
    ]
  },
  'hyeres': {
    name: 'Hyères',
    slug: 'hyeres',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Hyères 83', 'escort îles d\'Or', 'escort Porquerolles',
      'escort Var'
    ]
  },
  'salon-de-provence': {
    name: 'Salon-de-Provence',
    slug: 'salon-de-provence',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Salon-de-Provence 13', 'escort Bouches-du-Rhône', 'escort Patrouille de France'
    ]
  },
  'arles': {
    name: 'Arles',
    slug: 'arles',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Arles 13', 'escort Camargue', 'escort arènes Arles',
      'escort Rencontres photo'
    ]
  },
  'menton': {
    name: 'Menton',
    slug: 'menton',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Menton 06', 'escort frontière Italie', 'escort Côte d\'Azur',
      'escort Fête du Citron'
    ]
  },
  'grasse': {
    name: 'Grasse',
    slug: 'grasse',
    country: 'FR',
    region: 'Provence-Alpes-Côte d\'Azur',
    keywords: [
      'escort Grasse 06', 'escort capitale parfum', 'escort Alpes-Maritimes'
    ]
  },
  'monaco': {
    name: 'Monaco',
    slug: 'monaco',
    country: 'FR', // Associé à FR pour la recherche
    region: 'Monaco',
    keywords: [
      'escort Monaco', 'escort Monte-Carlo', 'escort luxe Monaco',
      'escort casino Monaco', 'escort Grand Prix Monaco', 'escort yacht Monaco',
      'escort principauté', 'escort millionnaire Monaco'
    ]
  },
  'thonon-les-bains': {
    name: 'Thonon-les-Bains',
    slug: 'thonon-les-bains',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Thonon 74', 'escort Haute-Savoie', 'escort lac Léman',
      'escort Évian'
    ]
  },
  'chamonix': {
    name: 'Chamonix',
    slug: 'chamonix',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Chamonix 74', 'escort Mont-Blanc', 'escort ski luxe',
      'escort station ski', 'escort Haute-Savoie'
    ]
  },
  'megeve': {
    name: 'Megève',
    slug: 'megeve',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Megève 74', 'escort ski luxe', 'escort station chic',
      'escort jet-set Megève'
    ]
  },
  'courchevel': {
    name: 'Courchevel',
    slug: 'courchevel',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Courchevel 73', 'escort ski luxe', 'escort 1850',
      'escort oligarque', 'escort hiver luxe'
    ]
  },
  'val-disere': {
    name: 'Val d\'Isère',
    slug: 'val-disere',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Val d\'Isère 73', 'escort ski', 'escort Tignes',
      'escort Espace Killy'
    ]
  },
  'meribel': {
    name: 'Méribel',
    slug: 'meribel',
    country: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    keywords: [
      'escort Méribel 73', 'escort Trois Vallées', 'escort ski Savoie'
    ]
  },
  'deauville': {
    name: 'Deauville',
    slug: 'deauville',
    country: 'FR',
    region: 'Normandie',
    keywords: [
      'escort Deauville 14', 'escort luxe Deauville', 'escort casino Deauville',
      'escort Festival Deauville', 'escort Calvados'
    ]
  },
}

export function getCityFromSlug(slug: string): CityData | null {
  return CITY_SEO_DATA[slug] || null
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITY_SEO_DATA)
}

export function getCitiesByCountry(country: 'FR' | 'BE' | 'CH'): CityData[] {
  return Object.values(CITY_SEO_DATA).filter(city => city.country === country)
}
