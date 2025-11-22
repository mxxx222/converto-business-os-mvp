#!/bin/bash

# OCR Pipeline Test Script
# Tests the OCR pipeline with a receipt image

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}DocFlow OCR Pipeline Test${NC}"
echo "================================"
echo ""

# Check if file path is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a receipt image path${NC}"
    echo "Usage: ./test-ocr.sh <path-to-receipt-image>"
    exit 1
fi

RECEIPT_PATH="$1"

# Check if file exists
if [ ! -f "$RECEIPT_PATH" ]; then
    echo -e "${RED}Error: File not found: $RECEIPT_PATH${NC}"
    exit 1
fi

# Check if file is an image
if ! file "$RECEIPT_PATH" | grep -qE "(JPEG|PNG|WebP|image)"; then
    echo -e "${RED}Error: File is not a valid image${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} File found: $RECEIPT_PATH"
echo ""

# Get base URL (default to localhost)
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3001}"
echo "Using API URL: $BASE_URL"
echo ""

# Step 1: Upload file
echo "Step 1: Uploading receipt..."
UPLOAD_RESPONSE=$(curl -s -X POST \
    -F "file=@$RECEIPT_PATH" \
    -F "userId=demo-user" \
    "$BASE_URL/api/documents/upload")

# Check if upload was successful
if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC} Upload successful"
else
    echo -e "${RED}✗${NC} Upload failed"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

# Extract document ID
DOCUMENT_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$DOCUMENT_ID" ]; then
    echo -e "${RED}✗${NC} Failed to extract document ID"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo "Document ID: $DOCUMENT_ID"
echo ""

# Step 2: Wait for processing
echo "Step 2: Waiting for OCR processing..."
MAX_ATTEMPTS=60
ATTEMPT=0
STATUS="processing"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
    
    # Get document status
    DOC_RESPONSE=$(curl -s "$BASE_URL/api/documents/$DOCUMENT_ID")
    STATUS=$(echo "$DOC_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    
    if [ "$STATUS" = "completed" ]; then
        echo -e "${GREEN}✓${NC} Processing completed"
        break
    elif [ "$STATUS" = "error" ] || [ "$STATUS" = "failed" ]; then
        echo -e "${RED}✗${NC} Processing failed"
        ERROR_MSG=$(echo "$DOC_RESPONSE" | grep -o '"error_message":"[^"]*' | cut -d'"' -f4)
        echo "Error: $ERROR_MSG"
        exit 1
    fi
    
    if [ $((ATTEMPT % 5)) -eq 0 ]; then
        echo "  Still processing... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    fi
done

if [ "$STATUS" != "completed" ]; then
    echo -e "${RED}✗${NC} Processing timeout"
    exit 1
fi

echo ""

# Step 3: Display results
echo "Step 3: Extracted Data"
echo "======================"
echo ""

# Extract OCR data
OCR_DATA=$(echo "$DOC_RESPONSE" | grep -o '"ocr_data":{[^}]*}' | sed 's/"ocr_data"://')

if [ -z "$OCR_DATA" ]; then
    echo -e "${RED}✗${NC} No OCR data found"
    exit 1
fi

# Pretty print JSON (if jq is available)
if command -v jq &> /dev/null; then
    echo "$DOC_RESPONSE" | jq '.ocr_data'
else
    echo "$OCR_DATA"
fi

echo ""
echo -e "${GREEN}✓${NC} Test completed successfully!"
echo ""
echo "View full results at: $BASE_URL/api/documents/$DOCUMENT_ID"

