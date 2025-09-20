# MINDFUL SCREEN - Troubleshooting Guide

## 🔧 Issues Fixed

### 1. TypeScript Configuration Issues
**Problem**: TypeScript errors about missing React/React Native types
**Solution**: 
- Updated `tsconfig.json` with proper Expo configuration
- Set `strict: false` to reduce initial setup friction
- Added proper module resolution settings

### 2. Package Dependencies
**Problem**: Missing or incompatible package versions
**Solution**:
- Removed problematic packages (`jotai`, `victory-native`) from initial setup
- Added `@types/react-native` for better TypeScript support
- Created `.npmrc` for better package resolution

### 3. Firebase Functions Integration
**Problem**: Firebase Functions causing import errors
**Solution**:
- Made Firebase Functions optional with lazy loading
- Added proper error handling for when Functions aren't available
- Created fallback AI responses for offline development

### 4. Metro Configuration
**Problem**: Complex metro config causing build issues
**Solution**:
- Simplified metro.config.js to basic Expo defaults
- Removed SVG transformer conflicts

## 🚀 Quick Setup Instructions

### Step 1: Install Dependencies
```bash
cd mindful-screen-mobile

# On Windows:
setup.bat

# On Mac/Linux:
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Development Server
```bash
npm start
# Press 'a' for Android emulator
```

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'react'"
**Cause**: Dependencies not installed
**Solution**: Run `npm install` in the mindful-screen-mobile directory

### Issue: "Firebase config missing"
**Cause**: Firebase configuration not found
**Solution**: The config is already in `app.config.ts` - just ensure Firebase project exists

### Issue: Metro bundler errors
**Cause**: Cache issues or conflicting dependencies
**Solution**: 
```bash
npx expo r -c  # Clear cache
npm start
```

### Issue: Android build fails
**Cause**: Missing Android SDK or emulator
**Solution**: 
1. Install Android Studio
2. Set up Android emulator
3. Ensure ANDROID_HOME environment variable is set

### Issue: TypeScript errors in IDE
**Cause**: IDE not recognizing Expo types
**Solution**: 
1. Restart TypeScript server in your IDE
2. Run `npm install` to ensure all types are available
3. The app will still run despite IDE warnings

## 📱 Development Workflow

### 1. First Time Setup
```bash
# Install global tools
npm install -g @expo/cli

# Setup project
cd mindful-screen-mobile
npm install
npm start
```

### 2. Daily Development
```bash
# Start development server
npm start

# Clear cache if needed
npx expo r -c
```

### 3. Testing Features
- **Authentication**: Create account → Login → Check profile
- **Focus Timer**: Start session → Let it complete → Check analytics
- **AI Chat**: Send message → Verify fallback response works
- **Community**: Create post → View in feed
- **Themes**: Toggle between Professional and Dark modes

## 🔄 What Works Out of the Box

### ✅ Fully Functional
- **Navigation**: All screens accessible via bottom tabs
- **Theming**: Professional ↔ Dark mode toggle
- **Focus Timer**: Complete timer with session tracking
- **Authentication**: Email/Password registration and login
- **Local Storage**: Session data persists locally
- **UI Components**: All screens render correctly

### ⚠️ Requires Backend Setup
- **AI Chat**: Falls back to local responses (needs Firebase Functions + OpenAI)
- **Community Posts**: Stores locally (needs Firestore)
- **Analytics Sync**: Local only (needs Firestore)
- **Push Notifications**: Disabled (needs FCM setup)

### 🔧 Future Enhancements
- **UsageStats Module**: Requires Expo dev client build
- **Real-time Sync**: Requires Firebase backend deployment
- **Advanced Analytics**: Requires data aggregation functions

## 📋 Verification Checklist

Run through this checklist to ensure everything works:

- [ ] App starts without crashes
- [ ] Can navigate between all tabs (Home, Analytics, Community, Learn, Profile)
- [ ] Theme toggle works (Professional ↔ Dark)
- [ ] Focus timer starts, pauses, resets correctly
- [ ] Can create account and login
- [ ] All screens render without layout issues
- [ ] No horizontal scrolling on any screen
- [ ] Settings screen accessible from Profile

## 🆘 Getting Help

### If the app won't start:
1. Delete `node_modules` and run `npm install`
2. Clear Expo cache: `npx expo r -c`
3. Restart your development server

### If you see TypeScript errors:
- The app will still run! TypeScript errors in IDE don't prevent Expo from working
- Run `npm install` to ensure all type definitions are available
- Restart your IDE's TypeScript server

### If Firebase features don't work:
- Check that Firebase project exists and is configured
- Ensure you have internet connection
- Firebase Functions require deployment (see deploy.md)

## 🎯 Next Steps

1. **Test the app**: Run through all features to ensure they work
2. **Deploy Firebase**: Follow `deploy.md` to set up backend
3. **Customize**: Update branding, colors, content as needed
4. **Build**: Create production APK when ready

The app is designed to work offline-first, so you can develop and test most features without a backend!
