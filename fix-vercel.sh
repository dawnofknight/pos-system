#!/bin/bash

# Script to fix Vercel deployment by updating pnpm lockfile
# Run this before pushing to GitHub

set -e

echo "🔧 Fixing Vercel deployment - Updating pnpm lockfile..."
echo ""

cd "$(dirname "$0")"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing via npm..."
    npm install -g pnpm
    echo "✅ pnpm installed"
    echo ""
fi

echo "📦 Removing old lockfile..."
rm -f pnpm-lock.yaml
echo "✅ Removed old lockfile"
echo ""

echo "🔄 Regenerating pnpm-lock.yaml..."
pnpm install
echo "✅ Lockfile regenerated"
echo ""

echo "📝 Verifying lockfile..."
if [ -f "pnpm-lock.yaml" ]; then
    echo "✅ pnpm-lock.yaml created successfully"
    echo "   Size: $(du -h pnpm-lock.yaml | cut -f1)"
else
    echo "❌ Failed to create lockfile"
    exit 1
fi

echo ""
echo "🎉 Done! Now commit and push:"
echo ""
echo "   git add pnpm-lock.yaml package.json"
echo "   git commit -m 'fix: update pnpm lockfile for Vercel deployment'"
echo "   git push"
echo ""
echo "This will fix the Vercel deployment error."
