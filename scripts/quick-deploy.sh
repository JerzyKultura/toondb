#!/bin/bash

# ToonDB Quick Deploy Script
# This script helps you deploy ToonDB to your preferred platform

set -e

echo "🚀 ToonDB Quick Deploy"
echo "======================"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    echo ""
    
    if ! command_exists vercel; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🔐 Login to Vercel:"
    vercel login
    
    echo ""
    echo "📤 Deploying to production..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📝 Don't forget to set environment variables in Vercel dashboard:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "📦 Deploying to Netlify..."
    echo ""
    
    if ! command_exists netlify; then
        echo "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    echo "🔐 Login to Netlify:"
    netlify login
    
    echo ""
    echo "🔧 Initializing Netlify site..."
    netlify init
    
    echo ""
    echo "📤 Deploying to production..."
    netlify deploy --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📝 Don't forget to set environment variables in Netlify dashboard."
}

# Function to build Docker image
deploy_docker() {
    echo "🐳 Building Docker image..."
    echo ""
    
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first:"
        echo "   https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    echo "Building ToonDB image..."
    docker build -t toondb:latest .
    
    echo ""
    echo "✅ Docker image built successfully!"
    echo ""
    echo "To run the container:"
    echo "  docker run -d -p 3000:3000 \\"
    echo "    -e NEXT_PUBLIC_SUPABASE_URL=your_url \\"
    echo "    -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \\"
    echo "    -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \\"
    echo "    --name toondb toondb:latest"
    echo ""
    echo "Or use docker-compose:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Update environment variables in .env"
    echo "  3. Run: docker-compose up -d"
}

# Function to deploy to Railway
deploy_railway() {
    echo "📦 Deploying to Railway..."
    echo ""
    
    echo "Please follow these steps:"
    echo "1. Go to https://railway.app"
    echo "2. Click 'Start a New Project'"
    echo "3. Choose 'Deploy from GitHub repo'"
    echo "4. Select your forked repository"
    echo "5. Add environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - PORT=3000"
    echo ""
    echo "Railway will automatically deploy your app!"
}

# Show menu
echo "Choose your deployment platform:"
echo ""
echo "1) Vercel (Recommended - Zero config, free tier)"
echo "2) Netlify (Alternative to Vercel)"
echo "3) Docker (Self-hosting)"
echo "4) Railway (All-in-one with database)"
echo "5) Show full hosting guide"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        deploy_docker
        ;;
    4)
        deploy_railway
        ;;
    5)
        echo ""
        echo "📖 Full hosting guide available in HOSTING.md"
        echo ""
        echo "Quick links:"
        echo "- Vercel one-click: https://vercel.com/new/clone?repository-url=https://github.com/JerzyKultura/toondb"
        echo "- Documentation: See HOSTING.md for detailed instructions"
        echo ""
        ;;
    6)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Thank you for using ToonDB!"
echo "📖 For more information, see HOSTING.md"
echo ""
