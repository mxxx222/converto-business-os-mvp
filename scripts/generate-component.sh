#!/bin/bash
# 🚀 Generate Component Template - Kilo Codes Automation

COMPONENT_NAME=$1

if [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./scripts/generate-component.sh <component-name>"
  echo "Example: ./scripts/generate-component.sh UserCard"
  exit 1
fi

COMPONENT_FILE="frontend/components/${COMPONENT_NAME}.tsx"

cat > "$COMPONENT_FILE" << 'EOF'
'use client';

import { useState } from 'react';

interface COMPONENT_NAMEProps {
  // Add props here
}

export default function COMPONENT_NAME({}: COMPONENT_NAMEProps) {
  const [state, setState] = useState();

  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
}
EOF

# Replace placeholder
sed -i '' "s/COMPONENT_NAME/$COMPONENT_NAME/g" "$COMPONENT_FILE"
sed -i '' "s/component-name/${COMPONENT_NAME,,}/g" "$COMPONENT_FILE"

echo "✅ Generated component: $COMPONENT_FILE"
echo "   - Client component"
echo "   - TypeScript interface"
echo "   - Ready for development"
