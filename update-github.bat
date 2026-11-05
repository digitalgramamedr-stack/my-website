@echo off
chcp 65001 >nul
echo ========================================================
echo   Digital Gramam CSC - Auto GitHub Update & Deploy
echo ========================================================
cd /d "%~dp0"
git add .
git commit -m "Auto update Digital Gramam CSC website"
echo.
echo Pushing updates to GitHub (https://github.com/digitalgramamedr-stack/my-website.git)...
git push -u origin main
echo.
echo ========================================================
echo   Done! Your changes will be live online in ~30 seconds.
echo ========================================================
pause
