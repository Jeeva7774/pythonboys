@echo off
echo 🔥 FIREBASE AUTHENTICATION & API KEYS FIX
echo ==========================================

echo.
echo Step 1: Checking Firebase CLI...
firebase --version
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

echo.
echo Step 2: Logging into Firebase...
firebase login --reauth

echo.
echo Step 3: Setting correct project...
firebase use mindful-screen

echo.
echo Step 4: Getting current project info...
firebase projects:list

echo.
echo Step 5: Checking current functions config...
firebase functions:config:get

echo.
echo ⚠️  IMPORTANT: You need to set your OpenAI API key
echo Run this command with your actual API key:
echo firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY_HERE"
echo.

echo Step 6: Building and deploying functions...
cd firebase-functions
npm install
npm run build

echo.
echo Step 7: Deploying functions to asia-south1...
firebase deploy --only functions

echo.
echo Step 8: Testing mobile app...
cd ..\mindful-screen-mobile
npx expo start --clear

echo.
echo ✅ Firebase fix process completed!
echo.
echo Next steps:
echo 1. Set your OpenAI API key: firebase functions:config:set openai.key="YOUR_KEY"
echo 2. Test authentication in your mobile app
echo 3. Check the console logs for any remaining issues
echo.
pause
