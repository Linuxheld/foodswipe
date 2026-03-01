#!/bin/bash
# FoodSwipe Update Script v2
# Verwendung: ./update.sh "Beschreibung der Änderung"

FOODSWIPE_DIR="$HOME/foodswipe"
FILES_DIR="$HOME/Downloads/files"
MSG="${1:-Update}"

echo "🍽️  FoodSwipe Updater v2"
echo "================================"

# Dateien kopieren
echo "📁 Kopiere Dateien..."
[ -f "$FILES_DIR/App.jsx" ]              && cp "$FILES_DIR/App.jsx"              "$FOODSWIPE_DIR/src/App.jsx"              && echo "  ✅ App.jsx"
[ -f "$FILES_DIR/index.css" ]            && cp "$FILES_DIR/index.css"            "$FOODSWIPE_DIR/src/index.css"            && echo "  ✅ index.css"
[ -f "$FILES_DIR/index.html" ]           && cp "$FILES_DIR/index.html"           "$FOODSWIPE_DIR/index.html"               && echo "  ✅ index.html"
[ -f "$FILES_DIR/manifest.json" ]        && cp "$FILES_DIR/manifest.json"        "$FOODSWIPE_DIR/public/manifest.json"     && echo "  ✅ manifest.json"
[ -f "$FILES_DIR/foodswipe-icon.svg" ]   && cp "$FILES_DIR/foodswipe-icon.svg"   "$FOODSWIPE_DIR/public/foodswipe-icon.svg" && echo "  ✅ icon.svg"
[ -f "$FILES_DIR/foodswift-logo.png" ]   && cp "$FILES_DIR/foodswift-logo.png"   "$FOODSWIPE_DIR/public/foodswift-logo.png" && echo "  ✅ logo.png"

# Git Push
echo ""
echo "🚀 Push zu GitHub..."
cd "$FOODSWIPE_DIR"

if git diff --quiet && git diff --cached --quiet; then
  echo "  ⚠️  Keine Änderungen gefunden!"
  echo "  → Hast du die neuen Dateien in ~/Downloads/files/ abgelegt?"
  exit 1
fi

git add .
git commit -m "$MSG"
git push origin main

echo ""
echo "================================"
echo "✅ Fertig! Vercel deployed in ~2 Min."
echo "🌐 https://foodswipe-rose.vercel.app"
