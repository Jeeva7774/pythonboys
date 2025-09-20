# Firebase Authentication & API Keys Fix - PowerShell Version
# Run this in PowerShell as Administrator

Write-Host "🔥 FIREBASE AUTHENTICATION & API KEYS FIX" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Change to the correct directory
$projectPath = "C:\Users\HAROON\Desktop\Mindful screen"
Set-Location $projectPath

Write-Host "Step 1: Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

Write-Host ""
Write-Host "Step 2: Logging into Firebase..." -ForegroundColor Yellow
firebase login --reauth

Write-Host ""
Write-Host "Step 3: Setting correct project..." -ForegroundColor Yellow
firebase use mindful-screen

Write-Host ""
Write-Host "Step 4: Getting current project info..." -ForegroundColor Yellow
firebase projects:list

Write-Host ""
Write-Host "Step 5: Checking current functions config..." -ForegroundColor Yellow
firebase functions:config:get

Write-Host ""
Write-Host "⚠️  IMPORTANT: Setting OpenAI API Key" -ForegroundColor Red
Write-Host "Please enter your OpenAI API key (starts with sk-):" -ForegroundColor Yellow
$openaiKey = Read-Host "OpenAI API Key"

if ($openaiKey -and $openaiKey.StartsWith("sk-")) {
    Write-Host "Setting OpenAI API key..." -ForegroundColor Yellow
    firebase functions:config:set openai.key="$openaiKey"
    Write-Host "✅ OpenAI API key set successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Invalid API key format. Please set it manually:" -ForegroundColor Red
    Write-Host "firebase functions:config:set openai.key=`"YOUR_OPENAI_API_KEY`"" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 6: Building and deploying functions..." -ForegroundColor Yellow
Set-Location "firebase-functions"

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only functions

Write-Host ""
Write-Host "Step 7: Testing mobile app..." -ForegroundColor Yellow
Set-Location "..\mindful-screen-mobile"
npx expo start --clear

Write-Host ""
Write-Host "✅ Firebase fix process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check the Expo console for Firebase connection test results" -ForegroundColor White
Write-Host "2. Look for: '🔥 Starting Firebase Connection Tests...'" -ForegroundColor White
Write-Host "3. Test authentication in your mobile app" -ForegroundColor White
Write-Host "4. Check the console logs for any remaining issues" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit..."
