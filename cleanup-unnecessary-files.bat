@echo off
echo 🧹 Cleaning up unnecessary files from Mindful Screen project...
echo.

REM Remove all documentation markdown files (keeping only README.md and HACKATHON_DOCUMENTATION.md)
echo Removing documentation files...
if exist "AUTHENTICATION_SCREENS_READY.md" del "AUTHENTICATION_SCREENS_READY.md"
if exist "BUGS_FIXED_SUMMARY.md" del "BUGS_FIXED_SUMMARY.md"
if exist "ERRORS_FIXED.md" del "ERRORS_FIXED.md"
if exist "FEATURES.md" del "FEATURES.md"
if exist "FEATURES_COMPLETE.md" del "FEATURES_COMPLETE.md"
if exist "FIREBASE_API_COMPLETE_FIX.md" del "FIREBASE_API_COMPLETE_FIX.md"
if exist "ISSUE_RESOLVED_SUMMARY.md" del "ISSUE_RESOLVED_SUMMARY.md"
if exist "LOADING_LOOP_FIXED.md" del "LOADING_LOOP_FIXED.md"
if exist "MANUAL_FIX_STEPS.md" del "MANUAL_FIX_STEPS.md"
if exist "MINDFUL_SCREEN_COMPLETE.md" del "MINDFUL_SCREEN_COMPLETE.md"
if exist "PROJECT_STRUCTURE_ANALYSIS.md" del "PROJECT_STRUCTURE_ANALYSIS.md"
if exist "REAL_FIREBASE_AUTH_GUIDE.md" del "REAL_FIREBASE_AUTH_GUIDE.md"
if exist "SETUP.md" del "SETUP.md"
if exist "TROUBLESHOOTING.md" del "TROUBLESHOOTING.md"
if exist "UI_DESIGN.md" del "UI_DESIGN.md"
if exist "WORKSPACE_ANALYSIS_COMPLETE.md" del "WORKSPACE_ANALYSIS_COMPLETE.md"
if exist "WORKSPACE_REBUILT_SUCCESS.md" del "WORKSPACE_REBUILT_SUCCESS.md"
if exist "deploy.md" del "deploy.md"

REM Remove temporary/test files
echo Removing temporary and test files...
if exist "firebase-test.js" del "firebase-test.js"
if exist "fix-firebase-auth.bat" del "fix-firebase-auth.bat"
if exist "fix-firebase-auth.ps1" del "fix-firebase-auth.ps1"
if exist "cleanup-project.bat" del "cleanup-project.bat"

REM Remove empty directories
echo Removing empty directories...
if exist "mindful screen" rmdir "mindful screen" /s /q 2>nul
if exist "src\components" rmdir "src\components" /s /q 2>nul

REM Remove Firebase Functions directory (since we're using demo mode)
echo Removing Firebase Functions (using demo mode)...
if exist "firebase-functions" rmdir "firebase-functions" /s /q 2>nul

REM Remove Firebase config files (keeping only what's needed for demo)
echo Removing unnecessary Firebase config files...
if exist "firestore.indexes.json" del "firestore.indexes.json"
if exist "firestore.rules" del "firestore.rules"
if exist "storage.rules" del "storage.rules"

REM Remove this cleanup script itself
echo Cleaning up cleanup script...
if exist "cleanup-unnecessary-files.bat" del "cleanup-unnecessary-files.bat"

echo.
echo ✅ Cleanup complete! 
echo.
echo 📁 Kept essential files:
echo   - All source code in src/ folder
echo   - README.md (main documentation)
echo   - HACKATHON_DOCUMENTATION.md (for presentation)
echo   - package.json and dependencies
echo   - App configuration files
echo   - start.bat (quick start script)
echo.
echo 🚀 Your app is ready to run with: start.bat
echo.
pause
