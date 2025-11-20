#!/bin/bash

# ToonDB Deployment Script

set -e

echo "🚀 Deploying ToonDB..."

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run 'vercel login' first."
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "☁️  Deploying to Vercel..."
vercel --prod

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
npx supabase functions deploy parse-toon
npx supabase functions deploy convert-toon-json
npx supabase functions deploy count-tokens

echo ""
echo "✨ Deployment complete!"
echo ""
echo "View your deployment:"
vercel inspect
echo ""

