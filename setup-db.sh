#!/bin/bash

echo "🔧 Setting up database..."

echo "📝 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "✅ Database setup complete!"
echo "🌱 Running seed (if needed)..."
npx prisma db seed || echo "⚠️  Seed script not configured or failed"

echo ""
echo "✨ All done! You can now run: pnpm dev"
