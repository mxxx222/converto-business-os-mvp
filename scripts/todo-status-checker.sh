#!/bin/bash
# 📋 Converto TODO Status Checker
# Checks completion status of TODO items and creates status report

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TODO_FILE="TODO.md"
STATUS_REPORT="TODO_STATUS_REPORT.md"

echo -e "${BLUE}📋 Converto TODO Status Checker${NC}"
echo "=================================="
echo ""

# Check if TODO.md exists
if [ ! -f "$TODO_FILE" ]; then
    echo -e "${RED}❌ TODO.md not found${NC}"
    exit 1
fi

# Count completed vs pending items
completed=$(grep -c "^- \[x\]" "$TODO_FILE" || echo "0")
pending=$(grep -c "^- \[ \]" "$TODO_FILE" || echo "0")
total=$((completed + pending))

# Calculate percentage
if [ $total -gt 0 ]; then
    percentage=$((completed * 100 / total))
else
    percentage=0
fi

# Check critical path items
critical_completed=$(grep -A 10 "## 🚨 CRITICAL PATH" "$TODO_FILE" | grep -c "^- \[x\]" || echo "0")
critical_pending=$(grep -A 10 "## 🚨 CRITICAL PATH" "$TODO_FILE" | grep -c "^- \[ \]" || echo "0")

# Check environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"
posthog_set="❌"
if [ -n "$NEXT_PUBLIC_POSTHOG_KEY" ]; then
    posthog_set="✅"
fi

resend_set="❌"
if [ -n "$RESEND_API_KEY" ]; then
    resend_set="✅"
fi

supabase_set="❌"
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    supabase_set="✅"
fi

# Generate status report
cat > "$STATUS_REPORT" << EOF
# 📊 Converto TODO Status Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')

## 📈 Overall Progress

- **Completed:** $completed / $total ($percentage%)
- **Pending:** $pending / $total

## 🚨 Critical Path Status

- **Completed:** $critical_completed
- **Pending:** $critical_pending

## 🔧 Environment Variables

- **PostHog:** $posthog_set \`NEXT_PUBLIC_POSTHOG_KEY\`
- **Resend:** $resend_set \`RESEND_API_KEY\`
- **Supabase:** $supabase_set \`NEXT_PUBLIC_SUPABASE_URL\` & \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

## 📋 Priority Breakdown

### Priority 1 (Launch Immediately)
\`\`\`
$(grep -A 50 "## 🔥 PRIORITY 1" "$TODO_FILE" | grep -E "^- \[(x| )\]" | head -20)
\`\`\`

### Priority 2 (Weeks 2-4)
\`\`\`
$(grep -A 50 "## 🎯 PRIORITY 2" "$TODO_FILE" | grep -E "^- \[(x| )\]" | head -20)
\`\`\`

## 🎯 Next Actions

1. **Set PostHog environment variables** (if not set)
2. **Complete critical path items** ($critical_pending remaining)
3. **Send launch emails** using \`scripts/launch-automation.sh\`
4. **Monitor deployment status**

---
*Run \`./scripts/todo-status-checker.sh\` to regenerate this report*
EOF

echo -e "${GREEN}✅ Status report generated: $STATUS_REPORT${NC}"
echo ""
echo "Summary:"
echo -e "  Completed: ${GREEN}$completed${NC} / $total ($percentage%)"
echo -e "  Pending: ${YELLOW}$pending${NC} / $total"
echo -e "  Critical Path: ${GREEN}$critical_completed${NC} completed, ${YELLOW}$critical_pending${NC} pending"
echo ""
echo "Environment Status:"
echo -e "  PostHog: $posthog_set"
echo -e "  Resend: $resend_set"
echo -e "  Supabase: $supabase_set"
echo ""



