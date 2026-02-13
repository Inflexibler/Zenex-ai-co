#!/bin/bash

# ZENEX AI - Quick Setup Script
# Run this after cloning the repo

echo "🚀 ZENEX AI - Quick Setup"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "📝 Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "🔧 IMPORTANT: Edit .env.local and fill in your actual values!"
    echo ""
else
    echo "✅ .env.local exists"
fi

# Type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript errors found (this is normal if .env.local is not filled)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:3000"
echo ""
echo "📖 For deployment, see DEPLOYMENT.md"
echo ""
