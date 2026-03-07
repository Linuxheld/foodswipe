#!/bin/bash
# FoodSwipe Update Script v6
# Sucht automatisch in allen möglichen Pfaden

FOODSWIPE_DIR="$HOME/foodswipe"
MSG="${1:-Update}"

# Automatisch richtigen Pfad finden
if   [ -f "$HOME/Downloads/files/App.jsx" ];      then FILES_DIR="$HOME/Downloads/files"
elif [ -f "$HOME/Downloads/foodswipe/App.jsx" ];  then FILES_DIR="$HOME/Downloads/foodswipe"
elif [ -f "$HOME/Downloads/App.jsx" ];             then FILES_DIR="$HOME/Downloads"
else
  echo "❌ App.jsx nicht gefunden!"
  echo "   Gesucht in:"
  echo "   ~/Downloads/files/"
  echo "   ~/Downloads/foodswipe/"
  echo "   ~/Downloads/"
  exit 1
fi

echo "🍽️  FoodSwipe Updater v6"
echo "📂 Pfad: $FILES_DIR"
echo "================================"

echo "📁 Kopiere Dateien..."
[ -f "$FILES_DIR/App.jsx" ]                  && cp "$FILES_DIR/App.jsx"                  "$FOODSWIPE_DIR/src/App.jsx"               && echo "  ✅ App.jsx"
[ -f "$FILES_DIR/index.css" ]                && cp "$FILES_DIR/index.css"                "$FOODSWIPE_DIR/src/index.css"             && echo "  ✅ index.css"
[ -f "$FILES_DIR/index.html" ]               && cp "$FILES_DIR/index.html"               "$FOODSWIPE_DIR/index.html"                && echo "  ✅ index.html"
[ -f "$FILES_DIR/manifest.json" ]            && cp "$FILES_DIR/manifest.json"            "$FOODSWIPE_DIR/public/manifest.json"      && echo "  ✅ manifest.json"
[ -f "$FILES_DIR/icon-192.png" ]             && cp "$FILES_DIR/icon-192.png"             "$FOODSWIPE_DIR/public/icon-192.png"       && echo "  ✅ icon-192.png"
[ -f "$FILES_DIR/icon-512.png" ]             && cp "$FILES_DIR/icon-512.png"             "$FOODSWIPE_DIR/public/icon-512.png"       && echo "  ✅ icon-512.png"
[ -f "$FILES_DIR/apple-touch-icon-180.png" ] && cp "$FILES_DIR/apple-touch-icon-180.png" "$FOODSWIPE_DIR/public/apple-touch-icon-180.png" && echo "  ✅ apple-touch-icon"
[ -f "$FILES_DIR/favicon-32.png" ]           && cp "$FILES_DIR/favicon-32.png"           "$FOODSWIPE_DIR/public/favicon-32.png"     && echo "  ✅ favicon-32.png"
[ -f "$FILES_DIR/foodswift-logo.png" ]       && cp "$FILES_DIR/foodswift-logo.png"       "$FOODSWIPE_DIR/public/foodswift-logo.png" && echo "  ✅ logo.png"

echo ""
echo "🚀 Push zu GitHub..."
cd "$FOODSWIPE_DIR"

if git diff --quiet && git diff --cached --quiet; then
  echo "  ⚠️  Keine Änderungen gefunden!"
  echo "  → Ist die App.jsx wirklich neu?"
  exit 1
fi

git add .
git commit -m "$MSG"
git push origin main

echo ""
echo "================================"
echo "✅ Fertig! Live in ~2 Min."
echo "🌐 https://foodswipe-rose.vercel.app"
