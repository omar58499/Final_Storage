# Quick setup script for Supabase migration (Windows PowerShell)

Write-Host "=========================================="
Write-Host "File Manager - Supabase Setup Script" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""

# Check if Node.js is installed
$nodeCheck = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js is installed: $nodeCheck" -ForegroundColor Green
Write-Host ""

# Navigate to server directory
Push-Location server

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Setup Steps:" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to supabase.com and create a free account" -ForegroundColor Yellow
Write-Host "2. Create a new project" -ForegroundColor Yellow
Write-Host "3. Go to SQL Editor and run the SQL queries from SUPABASE_SETUP.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Get your credentials from Project Settings → API:" -ForegroundColor Yellow
Write-Host "   - Copy Project URL (SUPABASE_URL)" -ForegroundColor Yellow
Write-Host "   - Copy service_role key (SUPABASE_SERVICE_KEY)" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Create a .env file in the server directory:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   SUPABASE_URL=your_url"
Write-Host "   SUPABASE_SERVICE_KEY=your_key"
Write-Host "   JWT_SECRET=your_secret"
Write-Host "   PORT=5000"
Write-Host ""
Write-Host "6. Run the server:" -ForegroundColor Yellow
Write-Host "   npm start"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Pop-Location
