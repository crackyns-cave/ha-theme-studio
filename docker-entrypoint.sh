#!/bin/bash
set -e

echo "==========================================
 HA Theme Studio
 Initializing...
=========================================="

# Ensure volume directories exist
echo "📁 Setting up volume directories..."
mkdir -p /framework /output /assets

# Check if framework folder is empty or doesn't exist
if [ -z "$(ls -A /framework 2>/dev/null)" ]; then
  echo "📦 Framework folder is empty"
  echo "📋 Copying default framework..."
  
  cp -r /app/default-framework/* /framework/
  
  echo "✓ Default framework copied to /framework"
  echo "  You can now customize the framework"
else
  echo "✓ Framework folder exists with content"
  echo "  Skipping default framework copy"
  echo "  (User modifications preserved)"
fi

echo "==========================================
 Framework: /framework
 Output:    /output
 Ready to build themes!
=========================================="

# Execute the main command (as root for simplicity)
exec "$@"
