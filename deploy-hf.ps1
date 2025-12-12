# Hugging Face Deployment Script
# This script helps you deploy your portfolio to Hugging Face Spaces

Write-Host "=== Hugging Face Portfolio Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if dist folder exists
if (-Not (Test-Path "dist")) {
    Write-Host "Error: dist folder not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ dist folder found" -ForegroundColor Green

# Step 2: Check for required files
if (-Not (Test-Path ".spacesconfig.yaml")) {
    Write-Host "Error: .spacesconfig.yaml not found" -ForegroundColor Red
    exit 1
}

if (-Not (Test-Path "README_HF.md")) {
    Write-Host "Error: README_HF.md not found" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Configuration files found" -ForegroundColor Green
Write-Host ""

# Step 3: Instructions
Write-Host "Next steps to deploy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create a Space on Hugging Face:" -ForegroundColor White
Write-Host "   - Go to https://huggingface.co/spaces" -ForegroundColor Gray
Write-Host "   - Click 'Create new Space'" -ForegroundColor Gray
Write-Host "   - Choose SDK: Static" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Choose your deployment method:" -ForegroundColor White
Write-Host ""
Write-Host "   METHOD A - Manual Upload (Easiest):" -ForegroundColor Cyan
Write-Host "   a. Go to your Space's Files tab" -ForegroundColor Gray
Write-Host "   b. Upload all files from the 'dist' folder" -ForegroundColor Gray
Write-Host "   c. Upload 'README_HF.md' as 'README.md'" -ForegroundColor Gray
Write-Host "   d. Upload '.spacesconfig.yaml'" -ForegroundColor Gray
Write-Host ""

Write-Host "   METHOD B - Git Push:" -ForegroundColor Cyan
Write-Host "   Run these commands (replace YOUR_USERNAME and YOUR_SPACE):" -ForegroundColor Gray
Write-Host "   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE" -ForegroundColor DarkGray
Write-Host "   git checkout --orphan hf-deploy" -ForegroundColor DarkGray
Write-Host "   git rm -rf ." -ForegroundColor DarkGray
Write-Host "   Copy-Item README_HF.md README.md" -ForegroundColor DarkGray
Write-Host "   git add README.md .spacesconfig.yaml" -ForegroundColor DarkGray
Write-Host "   Copy-Item -Recurse dist\* ." -ForegroundColor DarkGray
Write-Host "   git add ." -ForegroundColor DarkGray
Write-Host "   git commit -m 'Deploy to Hugging Face'" -ForegroundColor DarkGray
Write-Host "   git push hf hf-deploy:main --force" -ForegroundColor DarkGray
Write-Host ""

Write-Host "3. Your portfolio will be live at:" -ForegroundColor White
Write-Host "   https://YOUR_USERNAME-YOUR_SPACE.hf.space" -ForegroundColor Green
Write-Host ""

Write-Host "For detailed instructions, see HUGGINGFACE_DEPLOYMENT.md" -ForegroundColor Yellow
