#!/bin/bash
echo "═══════════════════════════════════"
echo "  CERTO PIPELINE STATUS"
echo "═══════════════════════════════════"
echo ""
echo "📋 Otwarte Issues pipeline:"
gh issue list --repo PoiDNA/Certo --label "pipeline/code,pipeline/doc" --state open
echo ""
echo "🔀 Otwarte PR:"
gh pr list --repo PoiDNA/Certo --state open
echo ""
echo "⚡ Ostatnie Actions runs:"
gh run list --repo PoiDNA/Certo --limit 5
echo ""
echo "═══════════════════════════════════"
