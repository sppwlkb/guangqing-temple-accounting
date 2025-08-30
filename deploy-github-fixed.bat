@echo off
echo ========================================
echo Guangqing Temple Accounting - GitHub Deploy
echo ========================================
echo.

echo Step 1: Create GitHub Repository
echo Please go to https://github.com and login
echo Click the "+" button and select "New repository"
echo Fill in:
echo   - Repository name: guangqing-temple-accounting
echo   - Description: Guangqing Temple Accounting System
echo   - Visibility: Public
echo   - Do NOT check "Add a README file"
echo Click "Create repository"
echo.

echo Step 2: Enter your GitHub username
set /p username=GitHub Username: 

echo.
echo Step 3: Setting up remote repository...
git remote add origin https://github.com/%username%/guangqing-temple-accounting.git
git branch -M main
git push -u origin main

echo.
echo ========================================
echo Deployment Steps Completed!
echo ========================================
echo.
echo Next steps:
echo 1. Go to your GitHub repository page
echo 2. Click "Settings" tab
echo 3. Find "Pages" in the left menu
echo 4. In "Source" section, select "Deploy from a branch"
echo 5. In "Branch" dropdown, select "gh-pages"
echo 6. Click "Save"
echo.
echo Your app will be available at:
echo https://%username%.github.io/guangqing-temple-accounting/
echo.
pause 