#!/bin/bash
# launch-day-monitoring.sh - 24/7 monitoring during launch

echo "🔄 LAUNCH DAY MONITORING - 24/7"
echo "================================"
echo "Started: $(date)"

# Create logs directory
mkdir -p logs/monitoring

# Set monitoring interval (seconds)
INTERVAL=300  # 5 minutes

# Monitoring counter
COUNTER=0
MAX_ITERATIONS=288  # 24 hours * 12 checks per hour (every 5 minutes)

while [ $COUNTER -lt $MAX_ITERATIONS ]; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  LOG_FILE="logs/monitoring/launch-$(date +%Y%m%d).log"

  echo "[$TIMESTAMP] Monitoring check #$COUNTER" | tee -a "$LOG_FILE"

  # Health checks
  echo "[$TIMESTAMP] Health checks..." | tee -a "$LOG_FILE"

  # Frontend
  if curl -s -o /dev/null -w "%{http_code}" https://converto-fi.vercel.app | grep -q "200"; then
    echo "[$TIMESTAMP] ✓ Frontend: OK" | tee -a "$LOG_FILE"
  else
    echo "[$TIMESTAMP] ✗ Frontend: DOWN" | tee -a "$LOG_FILE"
    # Send alert (implement your alerting mechanism)
    echo "[$TIMESTAMP] ALERT: Frontend is down!" | tee -a "$LOG_FILE"
  fi

  # Backend (if available)
  if curl -s -o /dev/null -w "%{http_code}" https://api.converto.fi/health | grep -q "200"; then
    echo "[$TIMESTAMP] ✓ Backend: OK" | tee -a "$LOG_FILE"
  else
    echo "[$TIMESTAMP] ⚠️  Backend: Not responding (may be expected)" | tee -a "$LOG_FILE"
  fi

  # Sleep for interval
  echo "[$TIMESTAMP] Next check in $INTERVAL seconds..." | tee -a "$LOG_FILE"
  sleep $INTERVAL
  COUNTER=$((COUNTER + 1))
done

echo ""
echo "✅ 24-hour monitoring complete"
echo "Logs saved to: logs/monitoring/launch-$(date +%Y%m%d).log"
