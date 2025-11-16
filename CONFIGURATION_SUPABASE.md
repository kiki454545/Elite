# Configuration Supabase pour le système de vérification, l'historique admin et le support

## Étapes à suivre dans le Supabase Dashboard

### 1. Création de la table d'historique admin

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `scripts/create_admin_history.sql`
6. Cliquez sur **Run** pour exécuter la requête

### 2. Mise à jour de la table `verification_requests`

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `scripts/recreate_verification_table.sql`
6. Cliquez sur **Run** pour exécuter la requête

### 3. Configuration des policies du Storage

#### Option A : Via SQL Editor (Recommandé)

1. Toujours dans **SQL Editor**, créez une nouvelle requête
2. Copiez-collez le contenu du fichier `scripts/verification_storage_policies.sql`
3. Cliquez sur **Run**

#### Option B : Via l'interface Storage

1. Allez dans **Storage** dans le menu de gauche
2. Cliquez sur le bucket **verification-photos**
3. Allez dans l'onglet **Policies**
4. Cliquez sur **New policy** pour chaque policy :

**Policy 1 : Upload**
- Name: `Users can upload verification photos`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'verification-photos'`

**Policy 2 : Read**
- Name: `Anyone can view verification photos`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'verification-photos'`

**Policy 3 : Delete**
- Name: `Admins can delete verification photos`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression:
```sql
bucket_id = 'verification-photos'
AND EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.is_admin = TRUE
)
```

### 4. Création de la table des tickets de support

1. Toujours dans **SQL Editor**, créez une nouvelle requête
2. Copiez-collez le contenu du fichier `scripts/create_support_tickets.sql`
3. Cliquez sur **Run**

### 5. Création de la table des messages de tickets

1. Toujours dans **SQL Editor**, créez une nouvelle requête
2. Copiez-collez le contenu du fichier `scripts/create_ticket_messages.sql`
3. Cliquez sur **Run**

### 6. Vérification

Après avoir exécuté ces étapes :

1. Retournez sur votre application
2. Allez dans **Profil** > **Préférences de confidentialité**
3. Dans la section **Vérification du compte**, essayez d'uploader des photos
4. Le système devrait maintenant fonctionner correctement

### 7. En cas de problème

Si vous rencontrez toujours des erreurs :

1. Vérifiez la console du navigateur (F12 > Console) pour voir l'erreur exacte
2. Dans Supabase Dashboard, allez dans **Database** > **Tables** :
   - **verification_requests** : Vérifiez que la colonne `verification_photos` existe et est de type `TEXT[]`
   - **admin_history** : Vérifiez que la table existe avec toutes les colonnes
   - **support_tickets** : Vérifiez que la table existe avec toutes les colonnes
   - **ticket_messages** : Vérifiez que la table existe avec toutes les colonnes
3. Dans **Storage** > **verification-photos** > **Policies**
   - Vérifiez que les 3 policies sont bien créées et activées

## Fichiers SQL à exécuter (dans l'ordre)

1. `scripts/create_admin_history.sql` - Crée la table d'historique des actions admin
2. `scripts/recreate_verification_table.sql` - Recrée la table de vérification avec la bonne structure
3. `scripts/verification_storage_policies.sql` - Configure les policies du bucket storage
4. `scripts/create_support_tickets.sql` - Crée la table des tickets de support utilisateur
5. `scripts/create_ticket_messages.sql` - Crée la table des messages de conversation pour les tickets

---

**Note** : Ces étapes sont nécessaires car certaines configurations ne peuvent être faites que via le Supabase Dashboard pour des raisons de sécurité.

## Nouveau système d'historique

Une fois la table `admin_history` créée, toutes les actions effectuées dans le panel admin seront automatiquement enregistrées :

- ✅ Fermeture de tickets
- ✅ Approbation/refus de vérifications
- ✅ Traitement de signalements
- ✅ Suppression/vérification de profils

L'onglet **Historique** du panel admin permet de :
- 🔍 Rechercher par pseudo ou admin
- 🏷️ Filtrer par type (ticket, vérification, signalement, profil)
- 📅 Filtrer par date (aujourd'hui, cette semaine, ce mois)

## Système de support utilisateur

Une fois les tables `support_tickets` et `ticket_messages` créées, les utilisateurs peuvent :
- 📝 Créer des tickets de support avec sujet, message et priorité
- 📋 Voir la liste de leurs tickets avec leur statut
- 💬 Avoir une conversation continue avec le staff (plusieurs messages)
- 🔄 Suivre l'évolution de leurs demandes (ouvert, en cours, résolu)
- ✉️ Répondre aux messages du staff directement dans la conversation
- 🔁 Rouvrir automatiquement un ticket fermé en envoyant un nouveau message

**Fonctionnalités de conversation** :
- Interface type chat avec messages de gauche (admin) et de droite (utilisateur)
- Distinction claire entre les messages admin (badge violet "Support") et utilisateur
- Auto-scroll vers le dernier message
- Désactivation des réponses uniquement si le ticket est "résolu"

Les utilisateurs peuvent accéder au support via :
- **Profil** > **Support**
