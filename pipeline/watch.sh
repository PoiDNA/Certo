#!/bin/bash
echo "⚡ Ostatnie runs:"
gh run list --repo PoiDNA/Certo --limit 5
echo ""
echo "Podaj Run ID do obserwowania (Enter = ostatni):"
read RUN_ID
if [ -z "$RUN_ID" ]; then
  gh run watch --repo PoiDNA/Certo
else
  gh run watch "$RUN_ID" --repo PoiDNA/Certo
fi
