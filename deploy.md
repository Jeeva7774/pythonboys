# MINDFUL SCREEN - Deployment Guide

## 🚀 Complete Deployment Checklist

### Prerequisites Setup
- [ ] Node.js 18+ installed
- [ ] Expo CLI: `npm install -g @expo/cli`
- [ ] Firebase CLI: `npm install -g firebase-tools`
- [ ] Android Studio (for Android development)
- [ ] OpenAI API key for AI chat functionality

### 1. Firebase Project Setup

#### A. Create Firebase Project
```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select: Firestore, Functions, Storage, Hosting
# Choose existing project: mindful-screen
# Functions language: TypeScript
# Region: asia-south1
```

#### B. Enable Firebase Services
In Firebase Console (https://console.firebase.google.com):

1. **Authentication**
   - Enable Email/Password provider
   - Enable Google Sign-In provider
   - Add Android app with package: `com.mindfulscreen.app`
   - Download `google-services.json`

2. **Firestore Database**
   - Create database in production mode
   - Region: asia-south1 (Mumbai)

3. **Storage**
   - Enable Firebase Storage
   - Region: asia-south1

4. **Cloud Messaging**
   - Enable FCM for push notifications

#### C. Deploy Firebase Backend
```bash
# Set OpenAI API key for Cloud Functions
firebase functions:config:set openai.key="sk-your-openai-api-key-here"

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Build and deploy Cloud Functions
cd firebase-functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 2. Mobile App Setup

#### A. Install Dependencies
```bash
cd mindful-screen-mobile
npm install

# Install Expo managed dependencies
npx expo install expo-constants expo-linking expo-notifications expo-device
npx expo install expo-auth-session expo-web-browser expo-intent-launcher
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install react-native-screens react-native-safe-area-context react-native-svg
```

#### B. Configure Android
1. Add `google-services.json` to `mindful-screen-mobile/` directory
2. Update `app.config.ts` with correct Firebase config
3. Ensure package name matches: `com.mindfulscreen.app`

#### C. Test Development Build
```bash
# Start Expo development server
npm start

# Test on Android emulator or device
# Press 'a' for Android
```

### 3. Production Build (EAS Build)

#### A. Setup EAS
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Initialize EAS
eas build:configure
```

#### B. Configure Build Profiles
Update `eas.json`:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### C. Build APK
```bash
# Build preview APK for testing
eas build -p android --profile preview

# Build production AAB for Play Store
eas build -p android --profile production
```

### 4. Testing Checklist

#### A. Core Functionality
- [ ] User registration and login works
- [ ] Focus timer starts, pauses, resets correctly
- [ ] Sessions are saved to Firestore
- [ ] XP and streak calculations work
- [ ] Theme toggle works (Professional ↔ Dark)
- [ ] Navigation between all tabs works

#### B. Firebase Integration
- [ ] User data syncs to Firestore
- [ ] AI chat gets responses from Cloud Functions
- [ ] Community posts can be created and viewed
- [ ] Analytics data loads correctly
- [ ] Push notifications work (if enabled)

#### C. UI/UX Testing
- [ ] All screens render correctly in both themes
- [ ] No horizontal scrolling issues
- [ ] Text is readable in both light and dark modes
- [ ] Buttons and interactive elements work
- [ ] Loading states display properly
- [ ] Error handling works gracefully

### 5. Play Store Preparation

#### A. App Store Assets
Create the following assets:
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (phone and tablet)
- [ ] App description and metadata

#### B. Privacy Policy & Terms
- [ ] Create privacy policy (required for Play Store)
- [ ] Create terms of service
- [ ] Add links in app Settings screen

#### C. Usage Access Disclosure
Ensure the onboarding screen includes the required text:
> "To provide accurate screen-time analytics and help reduce time spent on distracting apps, MINDFUL SCREEN requests usage access. We will only process this data on your device and to provide the app's features (you can revoke access anytime)."

### 6. Deployment Commands

#### Firebase
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

#### Mobile App
```bash
# Development
npm start

# Preview build
eas build -p android --profile preview

# Production build
eas build -p android --profile production

# Submit to Play Store (after production build)
eas submit -p android
```

### 7. Monitoring & Analytics

#### A. Firebase Console Monitoring
- Monitor Cloud Functions execution and errors
- Check Firestore usage and performance
- Monitor Authentication sign-ins
- Review Storage usage

#### B. App Performance
- Monitor crash reports (add Crashlytics if needed)
- Check user engagement metrics
- Monitor API usage and costs

### 8. Post-Deployment

#### A. User Feedback
- Monitor app store reviews
- Set up user feedback collection
- Track feature usage analytics

#### B. Maintenance
- Regular Firebase Functions updates
- Security rule reviews
- Performance optimizations
- Feature updates based on user feedback

### 9. Troubleshooting

#### Common Issues
1. **Build Failures**
   - Check `google-services.json` is in correct location
   - Verify package name matches across all configs
   - Ensure all dependencies are installed

2. **Firebase Connection Issues**
   - Verify Firebase config in `app.config.ts`
   - Check internet connectivity
   - Ensure Firebase services are enabled

3. **Cloud Functions Errors**
   - Check function logs: `firebase functions:log`
   - Verify OpenAI API key is set
   - Check function region (asia-south1)

4. **Authentication Issues**
   - Verify SHA-1/SHA-256 fingerprints for Google Sign-In
   - Check Firebase Auth configuration
   - Ensure proper redirect URLs

### 10. Success Metrics

#### Launch Criteria
- [ ] App builds and installs successfully
- [ ] All core features work end-to-end
- [ ] No critical bugs or crashes
- [ ] Performance is acceptable (< 3s load times)
- [ ] Privacy policy and terms are accessible
- [ ] Play Store requirements are met

#### Post-Launch KPIs
- Daily/Monthly Active Users
- Session completion rates
- User retention (Day 1, Day 7, Day 30)
- Community engagement metrics
- AI chat usage and satisfaction

---

## 🎉 Ready for Launch!

Once all checklist items are complete, your MINDFUL SCREEN app is ready for production deployment. The app includes:

✅ **Complete React Native app** with Expo managed workflow
✅ **Firebase backend** with Cloud Functions in asia-south1 region  
✅ **Secure authentication** with email/password and Google Sign-In
✅ **Focus tracking** with Firestore integration and XP system
✅ **AI chat assistant** powered by OpenAI via Cloud Functions
✅ **Community features** with posts, comments, and leaderboards
✅ **Gamification** with achievements, streaks, and skill roadmaps
✅ **Professional UI** with dark mode and cyberpunk theming
✅ **Play Store compliance** with usage access disclosures

The app is production-ready and follows all specified requirements!
