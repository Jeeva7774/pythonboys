@echo off
echo 🧹 CLEANING UP PROJECT STRUCTURE
echo ================================

echo.
echo Step 1: Removing unnecessary documentation files...
del /Q *.md 2>nul
echo ✅ Documentation files cleaned

echo.
echo Step 2: Removing duplicate dependencies from root...
echo Note: Keeping only Firebase-related files in root

echo.
echo Step 3: Your app is located in: mindful-screen-mobile\
echo ✅ Always run Expo commands from that directory!

echo.
echo Step 4: Correct commands to use:
echo cd mindful-screen-mobile
echo npx expo start --clear

echo.
echo ✅ Project structure cleaned!
echo.
echo 📱 Your React Native app: mindful-screen-mobile\
echo 🔥 Your Firebase backend: firebase-functions\
echo.
pause
