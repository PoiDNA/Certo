#!/bin/bash
TITLE="$1"
PHASE="${2:-code}"
LABEL="pipeline/${PHASE}"
if [ -z "$TITLE" ]; then
  echo "Użycie: $0 \"Tytuł\" doc|code"
  exit 1
fi
echo "Wpisz opis zadania (zakończ Ctrl+D):"
BODY=$(cat)
ISSUE_URL=$(gh issue create \
  --repo PoiDNA/Certo \
  --title "$TITLE" \
  --body "$BODY" \
  --label "$LABEL")
echo "✅ Issue: $ISSUE_URL"
echo "⏳ Pipeline startuje automatycznie..."
