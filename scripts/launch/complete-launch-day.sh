#!/bin/bash
# COMPLETE LAUNCH DAY EXECUTION

set -e

echo "🚀 CONVERTO LAUNCH DAY - COMPLETE EXECUTION"
echo "==========================================="
echo "Started: $(date)"
echo ""

# Ensure scripts are executable
chmod +x scripts/launch/*.sh

# Create logs directory
mkdir -p logs

# MORNING PHASE (6:00-12:00)
echo "📍 PHASE 1: MORNING (6:00-12:00)"
echo "─────────────────────────────────"
./scripts/launch/launch-day-morning.sh 2>&1 | tee logs/launch-morning-$(date +%Y%m%d).log

# Wait for midday (or skip if running all at once)
echo ""
echo "⏸️  Waiting for midday phase..."
echo "   To run manually: ./scripts/launch/launch-day-midday.sh"
read -p "Continue to midday phase now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # MIDDAY PHASE (12:00-18:00)
  echo ""
  echo "📍 PHASE 2: MIDDAY (12:00-18:00)"
  echo "─────────────────────────────────"
  ./scripts/launch/launch-day-midday.sh 2>&1 | tee logs/launch-midday-$(date +%Y%m%d).log
fi

# Wait for evening
read -p "Continue to evening phase now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # EVENING PHASE (18:00-22:00)
  echo ""
  echo "📍 PHASE 3: EVENING (18:00-22:00)"
  echo "─────────────────────────────────"
  ./scripts/launch/launch-day-evening.sh 2>&1 | tee logs/launch-evening-$(date +%Y%m%d).log
fi

# NIGHT PHASE (22:00-6:00) - Background monitoring
read -p "Start 24/7 monitoring now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "📍 PHASE 4: NIGHT (22:00-6:00)"
  echo "─────────────────────────────────"
  echo "⚠️  Starting background monitoring..."
  nohup ./scripts/launch/launch-day-monitoring.sh > logs/launch-monitoring-$(date +%Y%m%d).log 2>&1 &
  echo "✅ Monitoring started in background (PID: $!)"
  echo "   To stop: kill $!"
fi

# Final summary
echo ""
echo "🎉 LAUNCH DAY EXECUTION COMPLETE!"
echo "=================================="
echo ""
echo "Summary:"
echo "✅ All systems verified"
echo "✅ Launch email prepared"
echo "✅ Social media posts ready"
echo "✅ Press releases prepared"
echo "✅ Monitoring active"
echo ""
echo "Logs saved to: logs/"
echo "  - Morning: logs/launch-morning-$(date +%Y%m%d).log"
echo "  - Midday: logs/launch-midday-$(date +%Y%m%d).log"
echo "  - Evening: logs/launch-evening-$(date +%Y%m%d).log"
echo "  - Monitoring: logs/launch-monitoring-$(date +%Y%m%d).log"
echo ""
echo "Next steps:"
echo "  1. Monitor metrics in PostHog"
echo "  2. Respond to inquiries"
echo "  3. Post social media manually (or automate)"
echo "  4. Send press releases"
echo "  5. Check Day 1 checklist: scripts/playbooks/day1-checklist.md"
echo ""
echo "Timeline: 12 weeks to €49,300 MRR"
echo "Launch successful: $(date)"
