#!/bin/bash

# Simple fix for Vercel deployment - Switch to npm from pnpm
# This is the easiest solution if you don't have pnpm installed

set -e

echo "🔧 Fixing Vercel Deployment - Switching to npm..."
echo ""

cd "$(dirname "$0")"

echo "1️⃣  Removing pnpm-lock.yaml..."
rm -f pnpm-lock.yaml
echo "   ✅ Removed"
echo ""

echo "2️⃣  Installing with npm (will use existing package-lock.json)..."
npm install
echo "   ✅ Dependencies installed"
echo ""

echo "3️⃣  Verifying package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "   ✅ package-lock.json is ready"
    echo "   Size: $(du -h package-lock.json | cut -f1)"
else
    echo "   ❌ package-lock.json not found!"
    exit 1
fi

echo ""
echo "🎉 Done! Vercel will now use npm instead of pnpm."
echo ""
echo "📤 Next steps:"
echo ""
echo "   git add package.json package-lock.json"
echo "   git rm pnpm-lock.yaml"
echo "   git commit -m 'fix: switch from pnpm to npm for Vercel'"
echo "   git push"
echo ""
echo "✨ This will fix your Vercel deployment!"
