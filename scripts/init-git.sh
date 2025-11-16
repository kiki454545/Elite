#!/bin/bash

# Script d'initialisation Git et GitHub
# Ce script aide à préparer le projet pour le premier déploiement

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Initialisation Git pour Déploiement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé."
    echo "   Téléchargez-le sur : https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git est installé"
echo ""

# Vérifier si le dossier est déjà un dépôt Git
if [ -d ".git" ]; then
    echo "ℹ️  Ce projet est déjà un dépôt Git"
    echo ""

    # Vérifier s'il y a une remote origin
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        echo "✅ Remote 'origin' configurée : $REMOTE_URL"
    else
        echo "⚠️  Aucune remote 'origin' configurée"
        echo ""
        echo "Pour ajouter votre repository GitHub :"
        echo "git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git"
    fi
else
    echo "📦 Initialisation d'un nouveau dépôt Git..."
    git init
    echo "✅ Dépôt Git initialisé"
    echo ""

    echo "📝 Ajout des fichiers..."
    git add .
    echo "✅ Fichiers ajoutés au staging"
    echo ""

    echo "💾 Création du commit initial..."
    git commit -m "Initial commit - Ready for deployment"
    echo "✅ Commit initial créé"
    echo ""

    echo "🌿 Renommage de la branche en 'main'..."
    git branch -M main
    echo "✅ Branche 'main' créée"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Prochaines Étapes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Créez un repository sur GitHub : https://github.com/new"
echo ""
echo "2. Ajoutez la remote (remplacez par votre URL) :"
echo "   git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git"
echo ""
echo "3. Poussez le code :"
echo "   git push -u origin main"
echo ""
echo "4. Déployez sur Vercel : https://vercel.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Pour plus d'aide, consultez : GUIDE-DEPLOIEMENT-RAPIDE.md"
echo ""
