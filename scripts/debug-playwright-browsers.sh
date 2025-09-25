#!/bin/bash

# Debug script for Playwright browser installation issues
# This script helps diagnose browser installation problems in CI/CD

set -e

echo "🎭 Playwright Browser Installation Debug"
echo "========================================"

echo ""
echo "📋 Environment Information:"
echo "- OS: $(uname -s)"
echo "- Architecture: $(uname -m)"
echo "- Node.js: $(node --version)"
echo "- pnpm: $(pnpm --version)"
echo "- Playwright: $(pnpm exec playwright --version)"

echo ""
echo "📁 Checking Playwright cache directories:"
CACHE_DIRS=(
    "$HOME/.cache/ms-playwright"
    "node_modules/playwright-core/.local-browsers"
    "$HOME/.local/share/ms-playwright"
)

for dir in "${CACHE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
        echo "   Contents: $(ls -la "$dir" 2>/dev/null | wc -l) items"
        if [ "$(ls -A "$dir" 2>/dev/null)" ]; then
            echo "   Browsers: $(ls "$dir" 2>/dev/null | grep -E "(chromium|firefox|webkit)" | head -3)"
        fi
    else
        echo "❌ $dir does not exist"
    fi
done

echo ""
echo "🔍 Checking browser executables:"
BROWSERS=("chromium" "firefox" "webkit")

for browser in "${BROWSERS[@]}"; do
    echo "Checking $browser..."
    if pnpm exec playwright install --dry-run "$browser" >/dev/null 2>&1; then
        echo "✅ $browser is properly installed"
    else
        echo "❌ $browser is missing or corrupted"
        echo "   Attempting to install $browser..."
        pnpm exec playwright install "$browser" --with-deps
    fi
done

echo ""
echo "🧪 Running installation verification:"
if pnpm exec playwright install --dry-run chromium firefox webkit; then
    echo "✅ All browsers are properly installed and ready"
else
    echo "❌ Browser installation verification failed"
    echo "🔧 Attempting full reinstallation..."
    pnpm playwright:install:ci
    
    echo "🔍 Re-running verification..."
    if pnpm exec playwright install --dry-run chromium firefox webkit; then
        echo "✅ Reinstallation successful"
    else
        echo "❌ Reinstallation failed - manual intervention required"
        exit 1
    fi
fi

echo ""
echo "🎯 Browser installation debug complete!"