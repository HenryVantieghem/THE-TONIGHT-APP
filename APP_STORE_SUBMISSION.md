# App Store Submission Checklist for THE TONIGHT APP

## ⚠️ IMPORTANT: Expo Go vs Production Builds

**Expo Go is ONLY for development/testing** - it cannot be submitted to the App Store. You MUST use **EAS Build** to create production builds.

---

## 📋 Pre-Submission Checklist

### 1. **App Store Connect Setup** (Required First)

- [ ] Create Apple Developer Account ($99/year)
- [ ] Enroll in Apple Developer Program
- [ ] Create App Store Connect record:
  - [ ] App Name: "Tonight"
  - [ ] Bundle ID: `com.tonight.app`
  - [ ] Primary Language: English
  - [ ] Category: Social Networking
  - [ ] Age Rating: 17+ (due to user-generated content)
  - [ ] Privacy Policy URL (required!)
  - [ ] Support URL
  - [ ] Marketing URL (optional)

### 2. **App Store Listing Assets** (Required)

- [ ] **App Icon**: 1024x1024px PNG (no transparency, no rounded corners)
- [ ] **Screenshots** (Required for each device size):
  - [ ] iPhone 6.7" (iPhone 14 Pro Max): 1290x2796px (at least 3)
  - [ ] iPhone 6.5" (iPhone 11 Pro Max): 1242x2688px (at least 3)
  - [ ] iPhone 5.5" (iPhone 8 Plus): 1242x2208px (at least 3)
- [ ] **App Preview Video** (Optional but recommended): 15-30 seconds
- [ ] **Description**: Compelling app description (up to 4000 characters)
- [ ] **Keywords**: Up to 100 characters
- [ ] **Subtitle**: Up to 30 characters
- [ ] **Promotional Text**: Up to 170 characters (can be updated without review)

### 3. **Privacy & Compliance**

- [ ] **Privacy Policy** (MUST be hosted online, required!)
  - Must cover: data collection, location, photos, user content
  - Must mention GDPR compliance
  - Must explain account deletion process
- [ ] **Privacy Nutrition Labels** in App Store Connect:
  - [ ] Data Collection: Photos/Media, Location, User Content
  - [ ] Data Usage: App Functionality, Analytics
  - [ ] Data Linked to User: Yes
  - [ ] Tracking: Configure based on analytics tools
- [ ] **Age Rating**: 17+ (User Generated Content, Unrestricted Web Access)
- [ ] **Export Compliance**: Answer questions about encryption

### 4. **App Configuration** (Code Changes Needed)

- [ ] Update `app.json`:
  - [ ] Replace `"your-project-id"` with real EAS project ID
  - [ ] Add `buildNumber` for iOS
  - [ ] Configure app store URL
  - [ ] Add privacy policy URL
- [ ] Create `eas.json` configuration file
- [ ] Test production build locally first
- [ ] Verify all permissions work correctly
- [ ] Test account deletion flow (GDPR requirement)

### 5. **Build & Submit**

- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login to Expo: `eas login`
- [ ] Create EAS project: `eas init`
- [ ] Configure credentials: `eas credentials`
- [ ] Build iOS production: `eas build --platform ios --profile production`
- [ ] Wait for build to complete (15-30 minutes)
- [ ] Submit to App Store: `eas submit --platform ios`
- [ ] OR manually upload via App Store Connect

### 6. **Post-Submission**

- [ ] Fill out all App Store Connect metadata
- [ ] Upload screenshots and app preview
- [ ] Set pricing (Free or Paid)
- [ ] Select availability (all countries or specific)
- [ ] Submit for review
- [ ] Monitor review status
- [ ] Respond to any review feedback

---

## 🚀 Quick Start: Automated Submission

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Initialize EAS Project
```bash
eas init
```
This will:
- Create an EAS project
- Generate a project ID
- Update your `app.json` with the project ID

### Step 4: Configure Build Settings
The `eas.json` file is already created with proper settings.

### Step 5: Build for Production
```bash
eas build --platform ios --profile production
```

### Step 6: Submit to App Store
```bash
eas submit --platform ios
```

This will:
- Automatically upload your build to App Store Connect
- Use your Apple Developer credentials
- Handle all the technical submission steps

---

## 📝 Required Information Before Building

1. **Apple Developer Account**: You need an active Apple Developer Program membership
2. **App Store Connect Access**: Access to create apps in App Store Connect
3. **Privacy Policy URL**: Must be live before submission
4. **Support Email**: For App Store Connect
5. **Marketing URL** (optional): Your website

---

## 🔧 Configuration Files

### eas.json (Already Created)
Contains build profiles for development, preview, and production.

### app.json Updates Needed
- Replace `"your-project-id"` with actual EAS project ID (after `eas init`)
- Add `ios.buildNumber` for versioning
- Add `ios.appStoreUrl` (after creating App Store Connect record)

---

## ⚡ AI Prompt for Automated Submission

You can use this prompt with AI assistants:

```
I need to submit my Expo app "Tonight" to the App Store. Please:

1. Verify my app.json configuration is correct for App Store submission
2. Check that all required permissions are properly configured
3. Ensure privacy policy URLs are set
4. Guide me through creating an EAS build for iOS production
5. Help me submit the build to App Store Connect using EAS Submit
6. Verify all App Store Connect metadata requirements are met

My app:
- Bundle ID: com.tonight.app
- Uses camera, location, notifications, photo library
- Has user-generated content (ephemeral posts)
- Requires account deletion (GDPR compliance)
- Age rating should be 17+

Please walk me through the complete submission process step by step.
```

---

## 🎯 Critical Requirements Checklist

### Before Building:
- ✅ Bundle identifier is unique (`com.tonight.app`)
- ✅ Version number set (`1.0.0`)
- ✅ Build number will be auto-incremented
- ✅ All permission descriptions are user-friendly
- ✅ Privacy policy is live and accessible
- ✅ App Store Connect record created

### Before Submitting:
- ✅ Production build tested on real device
- ✅ All features work correctly
- ✅ No crashes or critical bugs
- ✅ Account deletion works (GDPR)
- ✅ Privacy policy accessible
- ✅ Screenshots prepared
- ✅ App description written

### During Review:
- ✅ App Store Connect metadata complete
- ✅ Screenshots uploaded
- ✅ Privacy policy URL working
- ✅ Support contact information valid
- ✅ Age rating appropriate (17+)

---

## 📞 Support Resources

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Expo Discord**: https://chat.expo.dev/

---

## ⏱️ Timeline Estimate

- **Setup**: 1-2 hours (if you have Apple Developer account)
- **Build**: 15-30 minutes (first build takes longer)
- **App Store Connect Setup**: 1-2 hours
- **Review**: 24-48 hours (typically)
- **Total**: 2-3 days from start to approval

---

## 🐛 Common Issues & Solutions

1. **"Project ID not found"**: Run `eas init` first
2. **"Credentials not configured"**: Run `eas credentials`
3. **"Privacy policy required"**: Must have live URL before submission
4. **"Build failed"**: Check build logs in Expo dashboard
5. **"App rejected"**: Usually due to missing privacy policy or incomplete metadata

---

## ✅ Final Checklist Before Clicking "Submit for Review"

- [ ] All screenshots uploaded
- [ ] App description complete and compelling
- [ ] Privacy policy URL working
- [ ] Support URL/email valid
- [ ] Age rating set correctly (17+)
- [ ] Privacy nutrition labels complete
- [ ] Export compliance answered
- [ ] App tested on real device
- [ ] No known crashes or bugs
- [ ] Account deletion works
- [ ] All permissions work correctly

---

**Good luck with your submission! 🚀**

