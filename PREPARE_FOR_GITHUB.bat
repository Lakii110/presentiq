@echo off
echo ========================================
echo  GitHub Upload Preparation Script
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Removing large files from Git cache...
echo This will NOT delete files, just remove them from Git tracking
echo.

git rm -r --cached .next 2>nul
git rm -r --cached node_modules 2>nul
git rm -r --cached dataset_speech 2>nul
git rm -r --cached archive/WAVE 2>nul
git rm -r --cached .venv 2>nul
git rm -r --cached dist 2>nul
git rm -r --cached backend/.venv 2>nul
git rm -r --cached combined_dataset 2>nul

echo.
echo Step 3: Adding updated .gitignore...
git add .gitignore
git add GITHUB_UPLOAD_GUIDE.md
git add DATASET_SETUP.md

echo.
echo Step 4: Committing changes...
git commit -m "Prepare for GitHub: Remove large files and add documentation"

echo.
echo ========================================
echo  Preparation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Run these commands (replace with your repo URL):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo See GITHUB_UPLOAD_GUIDE.md for detailed instructions
echo.
pause
