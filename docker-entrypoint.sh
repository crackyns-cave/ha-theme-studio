#!/bin/bash
set -e

echo "==========================================
 HA Theme Studio
 Initializing...
=========================================="

# Get user/group IDs from environment (set in Dockerfile)
APP_USER_ID=${APP_USER_ID:-1000}
APP_GROUP_ID=${APP_GROUP_ID:-1000}

echo "🔒 Running as root for initial setup..."
echo "   Target user: ${APP_USER_ID}:${APP_GROUP_ID}"

# Ensure volume directories exist and have correct ownership
echo "📁 Setting up volume directories..."
mkdir -p /framework /output
chown -R ${APP_USER_ID}:${APP_GROUP_ID} /framework /output

# Check if framework folder is empty or doesn't exist
if [ -z "$(ls -A /framework 2>/dev/null)" ]; then
  echo "📦 Framework folder is empty"
  echo "📋 Copying default framework..."
  
  cp -r /app/default-framework/* /framework/
  chown -R ${APP_USER_ID}:${APP_GROUP_ID} /framework
  
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

# Drop privileges and execute the main command as the app user
echo "🔓 Dropping to user ${APP_USER_ID}:${APP_GROUP_ID}..."
exec su-exec ${APP_USER_ID} "$@"
