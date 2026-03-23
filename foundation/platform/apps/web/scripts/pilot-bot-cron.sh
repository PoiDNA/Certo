#!/bin/bash
# Pilot Bot — cron wrapper
# Adds real EU entities + votes to certogov.org pilot map
#
# Crontab entries (add via: crontab -e):
#   23 9  * * 1-5  .../pilot-bot-cron.sh weekday-am
#   47 15 * * 1-5  .../pilot-bot-cron.sh weekday-pm
#   14 11 * * 0,6  .../pilot-bot-cron.sh weekend
#   33 12 * * *    .../pilot-bot-cron.sh votes

set -e

export PILOT_BOT_SECRET="92875yrfuicst8i7uj3ye4heb"
export PILOT_BOT_URL="https://www.certogov.org"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

CD_DIR="/Users/lk/work/certo/foundation/platform/apps/web"
LOG_DIR="$CD_DIR/scripts/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/pilot-bot-$(date +%Y-%m-%d).log"

MODE="${1:-weekday-am}"

cd "$CD_DIR"

case "$MODE" in
  weekday-am)
    BATCH=$(( RANDOM % 4 + 3 ))  # 3-6
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Mode: $MODE | Entities: $BATCH" >> "$LOG_FILE"
    npx tsx scripts/pilot-bot.ts --batch "$BATCH" >> "$LOG_FILE" 2>&1
    ;;
  weekday-pm)
    BATCH=$(( RANDOM % 3 + 2 ))  # 2-4
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Mode: $MODE | Entities: $BATCH" >> "$LOG_FILE"
    npx tsx scripts/pilot-bot.ts --batch "$BATCH" >> "$LOG_FILE" 2>&1
    ;;
  weekend)
    BATCH=$(( RANDOM % 2 + 1 ))  # 1-2
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Mode: $MODE | Entities: $BATCH" >> "$LOG_FILE"
    npx tsx scripts/pilot-bot.ts --batch "$BATCH" >> "$LOG_FILE" 2>&1
    ;;
  votes)
    VOTES=$(( RANDOM % 10 + 5 ))  # 5-14 votes
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Mode: votes | Count: $VOTES" >> "$LOG_FILE"
    npx tsx scripts/pilot-bot-votes.ts --votes "$VOTES" >> "$LOG_FILE" 2>&1
    ;;
  *)
    echo "Unknown mode: $MODE" >> "$LOG_FILE"
    exit 1
    ;;
esac

echo "$(date '+%Y-%m-%d %H:%M:%S') | Done ($MODE)" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
