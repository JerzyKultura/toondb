#!/bin/bash

# ToonDB Setup Script

set -e

echo "🎒 Setting up ToonDB..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your Supabase credentials"
fi

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found"
    echo "📝 You can install it with one of these methods:"
    echo "   1. Using npm (requires sudo): sudo npm install -g supabase"
    echo "   2. Using Homebrew: brew install supabase/tap/supabase"
    echo "   3. Use npx instead: npx supabase <command>"
    echo ""
    echo "For now, we'll use 'npx supabase' which doesn't require installation."
else
    echo "✅ Supabase CLI installed"
fi

# Initialize Supabase (if not already done)
if [ ! -d .supabase ]; then
    echo "🔧 Initializing Supabase..."
    npx supabase init
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Supabase credentials"
echo "2. Run 'npx supabase link --project-ref your-project-ref'"
echo "3. Run 'npx supabase db push' to push database schema"
echo "4. Run 'npm run dev' to start development server"
echo ""

