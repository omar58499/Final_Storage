#!/bin/bash
# Quick setup script for Supabase migration

echo "=========================================="
echo "File Manager - Supabase Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js is installed"
echo ""

# Navigate to server directory
cd server || exit 1

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "=========================================="
echo "Setup Steps:"
echo "=========================================="
echo ""
echo "1. Go to supabase.com and create a free account"
echo "2. Create a new project"
echo "3. Go to SQL Editor and run the SQL queries from SUPABASE_SETUP.md"
echo ""
echo "4. Get your credentials from Project Settings → API:"
echo "   - Copy Project URL (SUPABASE_URL)"
echo "   - Copy service_role key (SUPABASE_SERVICE_KEY)"
echo ""
echo "5. Create a .env file in the server directory:"
echo ""
echo "   SUPABASE_URL=your_url"
echo "   SUPABASE_SERVICE_KEY=your_key"
echo "   JWT_SECRET=your_secret"
echo "   PORT=5000"
echo ""
echo "6. Run the server:"
echo "   npm start"
echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
