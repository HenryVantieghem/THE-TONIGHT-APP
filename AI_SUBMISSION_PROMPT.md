# AI Prompt for App Store Submission

Copy and paste this prompt to any AI assistant (Claude, ChatGPT, etc.) to get step-by-step guidance for submitting your Expo app to the App Store:

---

## 🤖 AI Submission Prompt

```
I have an Expo React Native app called "Tonight" that I need to submit to the Apple App Store. Here's my current setup:

**App Details:**
- Name: Tonight
- Bundle ID: com.tonight.app
- Version: 1.0.0
- Platform: iOS (Expo SDK 54.0.0)
- Framework: React Native with Expo

**App Features:**
- Ephemeral photo/video sharing (posts expire after 1 hour)
- Location-based posts
- Friend system
- Camera access for photos/videos
- Location services
- Push notifications
- User-generated content

**Current Configuration:**
- app.json is configured with bundle identifier and permissions
- eas.json build configuration exists
- All required permission descriptions are in place
- Privacy policy will be hosted online before submission

**What I Need:**
1. Walk me through the complete App Store submission process step-by-step
2. Verify my app.json and eas.json configurations are correct
3. Guide me through:
   - Setting up EAS Build
   - Creating a production build
   - Submitting to App Store Connect
   - Filling out all required App Store Connect metadata
4. Help me identify any missing requirements
5. Provide specific commands I need to run
6. Explain what information I need to gather before starting

**Questions I Have:**
- Do I need to create the App Store Connect record first or after building?
- What's the exact order of operations?
- What information do I need from Apple Developer account?
- How do I handle the EAS project ID?
- What are the exact App Store Connect requirements for my app type?

Please provide a detailed, actionable guide with specific commands and checklists.
```

---

## 📋 Quick Command Reference

After running `eas init`, you can use these commands:

### 1. Build for Production
```bash
eas build --platform ios --profile production
```

### 2. Submit to App Store (Automated)
```bash
eas submit --platform ios
```

### 3. Check Build Status
```bash
eas build:list
```

### 4. View Build Logs
```bash
eas build:view [BUILD_ID]
```

---

## 🔄 Alternative: Manual Submission

If you prefer manual submission:

1. Build the app: `eas build --platform ios --profile production`
2. Download the `.ipa` file from Expo dashboard
3. Upload via:
   - **Transporter app** (macOS)
   - **App Store Connect** web interface
   - **Xcode Organizer**

---

## ⚡ One-Line Submission (After Setup)

Once everything is configured:

```bash
eas build --platform ios --profile production && eas submit --platform ios
```

This will:
1. Build your app
2. Wait for build completion
3. Automatically submit to App Store Connect

---

## 🎯 Pre-Flight Checklist

Before running the AI prompt, gather:

- [ ] Apple Developer Account credentials
- [ ] App Store Connect access
- [ ] Privacy Policy URL (must be live!)
- [ ] Support email address
- [ ] App description draft
- [ ] Screenshots (at least 3 per device size)
- [ ] App icon (1024x1024px)

---

## 📝 What the AI Will Help You With

1. **Configuration Verification**: Check all config files
2. **EAS Setup**: Initialize project and credentials
3. **Build Process**: Create production build
4. **Submission**: Upload to App Store Connect
5. **Metadata**: Fill out all required information
6. **Troubleshooting**: Fix any issues that arise

---

**Pro Tip**: Run the AI prompt in stages:
1. First: "Help me verify my configuration"
2. Second: "Guide me through building"
3. Third: "Help me submit and fill out metadata"

This way you get focused help at each stage!

