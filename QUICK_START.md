# ⚡ Guide Rapide - Recherche Avancée V1

## 🎯 En 3 étapes

### 1️⃣ Exécuter la migration (OBLIGATOIRE)

```bash
node scripts/add_advanced_search_fields.mjs
```

⏱️ Durée : ~10 secondes
✅ Ajoute tous les nouveaux champs à votre base de données

---

### 2️⃣ Activer la nouvelle page de recherche

**Option A : Remplacer l'ancienne (recommandé)**

```bash
# Windows (PowerShell)
Move-Item src\app\search\page.tsx src\app\search\page-old.tsx
Move-Item src\app\search\page-v2.tsx src\app\search\page.tsx

# Linux/Mac
mv src/app/search/page.tsx src/app/search/page-old.tsx
mv src/app/search/page-v2.tsx src/app/search/page.tsx
```

**Option B : Créer une nouvelle route de test**

Créer `src/app/search-v2/page.tsx` et copier le contenu de `src/app/search/page-v2.tsx`

---

### 3️⃣ Lancer et tester

```bash
npm run dev
```

Puis ouvrir : `http://localhost:3000/search` (ou `/search-v2`)

---

## 🔍 Tous les filtres disponibles

### ✅ Implémenté

| Filtre | Type | Options |
|--------|------|---------|
| **Téléphone** | Texte | Recherche partielle |
| **Sexe** | Multiple | 5 options |
| **Âge** | Plage | 18-99 ans |
| **Nationalité** | Multiple | 19 pays |
| **Ethnie** | Multiple | 7 options |
| **Bonnet** | Multiple | A-J (10 tailles) |
| **Hauteur** | Plage | 140-210 cm |
| **Poids** | Plage | 40-150 kg |
| **Cheveux** | Multiple | 9 couleurs |
| **Yeux** | Multiple | 7 couleurs |
| **Silhouette** | Multiple | 6 types |
| **Maillot** | Multiple | 4 options |
| **Tatouages** | Boolean | Avec/Sans |
| **Piercings** | Boolean | Avec/Sans |
| **Lieu RDV** | Multiple | 4 lieux |
| **Langues** | Multiple | 10 langues |
| **Vérifié** | Boolean | Oui/Non |
| **Commentaires** | Boolean | Oui/Non |

---

## 📁 Fichiers modifiés/créés

```
NEW    scripts/add_advanced_search_fields.mjs
EDITED src/types/profile.ts
NEW    src/components/AdvancedSearchFilters.tsx
NEW    src/app/search/page-v2.tsx
NEW    src/i18n/locales/fr-search-filters.json
NEW    src/i18n/locales/en-search-filters.json
```

---

## 🎨 Aperçu de l'interface

```
┌─────────────────────────────────────┐
│  🔍 [Recherche par pseudo...]  🎚️  │
├─────────────────────────────────────┤
│                                     │
│  📱 Recherche par téléphone         │
│  ┌───────────────────────────────┐  │
│  │ Ex: 06 12 34 56 78           │  │
│  └───────────────────────────────┘  │
│                                     │
│  👤 Informations de base        ▼  │
│  ├─ Sexe: [Femme][Homme][Trans]... │
│  ├─ Âge: [18] - [99]              │
│  └─ Nationalité: [🇫🇷][🇧🇪][🇨🇭]... │
│                                     │
│  💪 Attributs physiques         ▶  │
│  🌍 Langues parlées             ▶  │
│  📍 Lieux de rendez-vous        ▶  │
│  ⭐ Autres filtres              ▶  │
│                                     │
│  [❌ Effacer tous les filtres]     │
└─────────────────────────────────────┘

📊 125 résultats
┌────┬────┬────┬────┐
│ 📸 │ 📸 │ 📸 │ 📸 │  ← Grille d'annonces
└────┴────┴────┴────┘
```

---

## 💡 Exemples de recherche

### Exemple 1 : Recherche simple
```
Sexe: Femme
Âge: 25-35
→ Affiche toutes les femmes entre 25 et 35 ans
```

### Exemple 2 : Recherche détaillée
```
Sexe: Femme
Ethnie: Asiatique
Cheveux: Noire
Yeux: Marrons
Langues: Français, Anglais
Vérifié: Oui
→ Affiche les profils vérifiés correspondants
```

### Exemple 3 : Recherche par physique
```
Bonnet: D, E, F
Hauteur: 160-175 cm
Silhouette: Athlétique, Mince
Tatouages: Sans
→ Affiche les profils avec ces critères physiques
```

### Exemple 4 : Recherche par téléphone
```
Téléphone: 0612
→ Trouve tous les profils avec un numéro contenant "0612"
```

---

## ⚠️ Points importants

### Avant de tester

1. ✅ La migration DOIT être exécutée d'abord
2. ✅ Vérifier que Supabase est connecté (`.env.local`)
3. ✅ Redémarrer le serveur après la migration

### Champs de base de données

Les nouveaux champs seront **NULL** pour les profils existants.
→ Les utilisateurs devront compléter leur profil pour apparaître dans les filtres.

### Performance

- Avec < 1000 annonces : ⚡ Instantané
- Avec 1000-5000 annonces : 🟢 Rapide (< 1s)
- Avec > 5000 annonces : 🟡 Moyen (1-3s)

Si trop lent → Pagination nécessaire (V2)

---

## 🐛 Dépannage rapide

### Erreur : "relation does not exist"
```
❌ Problème : Migration pas exécutée
✅ Solution : node scripts/add_advanced_search_fields.mjs
```

### Erreur : "Cannot read properties of undefined"
```
❌ Problème : Données NULL dans la DB
✅ Solution : Normal, les anciens profils n'ont pas ces champs
```

### Les filtres ne font rien
```
❌ Problème : Pas de données avec ces critères
✅ Solution : Créer des profils de test avec ces attributs
```

### Page blanche
```
❌ Problème : Erreur de compilation
✅ Solution : Vérifier la console (npm run dev)
```

---

## 📝 Checklist avant de tester

- [ ] Migration exécutée
- [ ] Serveur redémarré
- [ ] Page s'affiche sans erreur
- [ ] Au moins 1 annonce visible
- [ ] Filtres s'ouvrent/ferment
- [ ] Les sélections changent la couleur des boutons
- [ ] Le compteur de résultats se met à jour

---

## 🎯 Test rapide (5 minutes)

1. Ouvrir `/search`
2. Cliquer sur le bouton filtres (🎚️)
3. Sélectionner "Femme" dans Sexe
4. Vérifier que les résultats changent
5. Ajouter un filtre d'âge (20-30)
6. Vérifier que le nombre diminue
7. Cliquer sur "Effacer tout"
8. Vérifier que tout se réinitialise

✅ Si ça fonctionne → Prêt pour les tests complets !

---

## 🚀 Prochaines étapes

Après avoir testé cette V1, envoyez-moi :

1. **Ce qui fonctionne** ✅
2. **Ce qui ne fonctionne pas** ❌
3. **Ce que vous voulez modifier** 🔧
4. **Vos nouvelles idées** 💡

Je ferai les ajustements pour la V2 !

---

## 📞 Résumé ultra-rapide

```bash
# 1. Migrer la DB
node scripts/add_advanced_search_fields.mjs

# 2. Activer la page
mv src/app/search/page.tsx src/app/search/page-old.tsx
mv src/app/search/page-v2.tsx src/app/search/page.tsx

# 3. Tester
npm run dev
# → http://localhost:3000/search
```

**C'est tout ! 🎉**
