#!/bin/bash

# ╔════════════════════════════════════════╗
# ║   FoodSwipe Update Script              ║
# ║   Einfach ausführen: bash update.sh    ║
# ╚════════════════════════════════════════╝

DOWNLOADS=~/Downloads
SRC=~/foodswipe/src
PUBLIC=~/foodswipe/public
ROOT=~/foodswipe

echo ""
echo "🍽️  FoodSwipe Update Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# App.jsx
if [ -f "$DOWNLOADS/App.jsx" ]; then
  cp "$DOWNLOADS/App.jsx" "$SRC/App.jsx"
  echo "✅ App.jsx aktualisiert"
  rm "$DOWNLOADS/App.jsx"
else
  echo "⚠️  App.jsx nicht in Downloads gefunden – übersprungen"
fi

# index.css
if [ -f "$DOWNLOADS/index.css" ]; then
  cp "$DOWNLOADS/index.css" "$SRC/index.css"
  echo "✅ index.css aktualisiert"
  rm "$DOWNLOADS/index.css"
fi

# index.html
if [ -f "$DOWNLOADS/index.html" ]; then
  cp "$DOWNLOADS/index.html" "$ROOT/index.html"
  echo "✅ index.html aktualisiert"
  rm "$DOWNLOADS/index.html"
fi

# manifest.json → public/
if [ -f "$DOWNLOADS/manifest.json" ]; then
  mkdir -p "$PUBLIC"
  cp "$DOWNLOADS/manifest.json" "$PUBLIC/manifest.json"
  echo "✅ manifest.json aktualisiert"
  rm "$DOWNLOADS/manifest.json"
fi

# Icon → public/
if [ -f "$DOWNLOADS/foodswipe-icon.svg" ]; then
  mkdir -p "$PUBLIC"
  cp "$DOWNLOADS/foodswipe-icon.svg" "$PUBLIC/foodswipe-icon.svg"
  echo "✅ App-Icon aktualisiert"
  rm "$DOWNLOADS/foodswipe-icon.svg"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Fertig! App wird neu geladen..."
echo ""

# Vite läuft bereits? Browser öffnen
if lsof -i :5173 > /dev/null 2>&1; then
  echo "✅ Vite läuft bereits – Browser aktualisiert sich automatisch!"
else
  echo "▶️  Starte Vite Server..."
  cd ~/foodswipe && npm run dev -- --host &
  sleep 2
  open http://localhost:5173
fi
