#!/bin/bash
# Test script for Agent Orchestrator API endpoints

API_URL="${API_URL:-http://localhost:8000}"
BASE_URL="${API_URL}/api/v1/agent-orchestrator"

echo "🧪 Testing Agent Orchestrator API"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -n "Testing: $description... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}${endpoint}")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        if [ -n "$body" ]; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
    else
        echo -e "${RED}✗${NC} (HTTP $http_code)"
        echo "$body"
    fi
    echo ""
}

# 1. List agents
test_endpoint "GET" "/agents" "" "List all agents"

# 2. List workflow templates
test_endpoint "GET" "/templates" "" "List workflow templates"

# 3. Execute workflow (receipt_processing)
echo "📋 Testing workflow execution..."
execution_data=$(cat <<EOF
{
  "template_id": "receipt_processing",
  "initial_variables": {
    "receipt_file": "/path/to/receipt.pdf"
  },
  "execution_name": "Test Receipt Processing"
}
EOF
)
test_endpoint "POST" "/workflows/execute" "$execution_data" "Execute receipt_processing workflow"

# Get execution ID from previous response (if successful)
EXECUTION_ID=$(echo "$body" | jq -r '.execution_id' 2>/dev/null)

if [ -n "$EXECUTION_ID" ] && [ "$EXECUTION_ID" != "null" ]; then
    echo "Waiting 2 seconds for workflow to start..."
    sleep 2

    # 4. Get workflow status
    test_endpoint "GET" "/workflows/${EXECUTION_ID}/status" "" "Get workflow status"

    # 5. Get workflow result (may fail if not completed)
    echo -n "Testing: Get workflow result (may fail if not completed)... "
    response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/workflows/${EXECUTION_ID}/result")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${YELLOW}⚠${NC} (HTTP $http_code) - Workflow may still be running"
        echo "$body"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠${NC} Could not get execution ID, skipping status/result tests"
    echo ""
fi

# 6. List workflow executions
test_endpoint "GET" "/executions" "" "List workflow executions"

echo ""
echo "================================"
echo "✅ Testing complete!"
echo ""
echo "📚 API Documentation: ${API_URL}/docs"


