@echo off
chcp 65001 >nul
echo ========================================================
echo   Digital Gramam CSC - Clean Secret History & Push
echo ========================================================
cd /d "%~dp0"

:: 1. Ensure .gitignore exists so .env and node_modules are never committed
(
echo .env
echo node_modules/
echo .gitignore.txt
) > .gitignore

:: 2. Soft reset main back to the last clean commit on GitHub (2e37628)
git reset --soft 2e37628

:: 3. Untrack .env and node_modules from git index
git rm -r --cached node_modules 2>nul
git rm --cached .env 2>nul
git rm --cached .gitignore.txt 2>nul

:: 4. Stage only clean files
git add .

:: 5. Commit and push to GitHub
git commit -m "Configure Gemini chatbot using process.env.GEMINI_API_KEY without secrets"
git push -u origin main

echo.
echo ========================================================
echo   Done! Pushed cleanly to GitHub.
echo ========================================================
pause
