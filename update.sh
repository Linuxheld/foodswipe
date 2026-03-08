#!/bin/bash
# FoodSwipe Updater v7 – sucht Dateien automatisch
PROJ="$HOME/foodswipe"
MSG="${1:-Update}"
echo "🍽️ FoodSwipe Updater v7"

# Auto-detect source folder
for DIR in "$HOME/Downloads/foodswipe" "$HOME/Downloads/files" "$HOME/Downloads"; do
  if [ -f "$DIR/App.jsx" ]; then FILES="$DIR"; break; fi
done
if [ -z "$FILES" ]; then echo "❌ Keine App.jsx gefunden in ~/Downloads/"; exit 1; fi
echo "📁 Quelle: $FILES"

# Copy files
[ -f "$FILES/App.jsx" ]              && cp "$FILES/App.jsx"              "$PROJ/src/App.jsx"              && echo "  ✅ App.jsx"
[ -f "$FILES/index.css" ]            && cp "$FILES/index.css"            "$PROJ/src/index.css"            && echo "  ✅ index.css"
[ -f "$FILES/index.html" ]           && cp "$FILES/index.html"           "$PROJ/index.html"               && echo "  ✅ index.html"
[ -f "$FILES/manifest.json" ]        && cp "$FILES/manifest.json"        "$PROJ/public/manifest.json"     && echo "  ✅ manifest.json"
[ -f "$FILES/foodswipe-icon.svg" ]   && cp "$FILES/foodswipe-icon.svg"   "$PROJ/public/foodswipe-icon.svg"&& echo "  ✅ icon.svg"
[ -f "$FILES/foodswift-logo.png" ]   && cp "$FILES/foodswift-logo.png"   "$PROJ/public/foodswift-logo.png"&& echo "  ✅ logo.png"
[ -f "$FILES/icon-192.png" ]         && cp "$FILES/icon-192.png"         "$PROJ/public/icon-192.png"      && echo "  ✅ icon-192.png"
[ -f "$FILES/icon-512.png" ]         && cp "$FILES/icon-512.png"         "$PROJ/public/icon-512.png"      && echo "  ✅ icon-512.png"
[ -f "$FILES/apple-touch-icon-180.png" ] && cp "$FILES/apple-touch-icon-180.png" "$PROJ/public/apple-touch-icon-180.png" && echo "  ✅ apple-touch-icon"
[ -f "$FILES/favicon-32.png" ]       && cp "$FILES/favicon-32.png"       "$PROJ/public/favicon-32.png"    && echo "  ✅ favicon-32.png"

# Git push
cd "$PROJ"
if git diff --quiet && git diff --cached --quiet; then
  echo "⚠️ Keine Änderungen. Dateien in $FILES ablegen!"
  exit 1
fi
git add . && git commit -m "$MSG" && git push origin main
echo ""
echo "✅ Fertig! Vercel deployed in ~2 Min."
echo "🌐 https://foodswipe-rose.vercel.app"
