# How to Prompt Me to Get This App to Full Use 🚀

## Quick Start Commands

### For Development Issues:
```
"Fix [specific issue] in [file/screen] - [describe what's broken]"
```

### For New Features:
```
"Add [feature name] to [screen/component] - [describe what it should do]"
```

### For Design Updates:
```
"Update [screen/component] design to match [reference/description]"
```

---

## 🎯 Most Effective Prompt Structure

### 1. **Be Specific About What's Broken**
❌ Bad: "The app doesn't work"
✅ Good: "Post creation fails with 'Failed to read image file' error when tapping Share with Friends"

### 2. **Include Context**
❌ Bad: "Fix location"
✅ Good: "Location search in LocationSearchScreen doesn't return results when I type 'Auburn' - the search results array stays empty"

### 3. **Mention What You've Tried**
✅ Good: "I tried restarting Expo Go but the timer bar still doesn't change colors"

### 4. **Include Screenshots/Errors**
✅ Good: "I'm getting this error: [paste error] - can you fix it?"

---

## 📋 Common Prompt Templates

### Fix a Bug:
```
"Fix [issue] in [component/screen]. 
Current behavior: [what happens]
Expected behavior: [what should happen]
Error message: [if any]
```

### Add a Feature:
```
"Add [feature] to [screen/component].
Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]
```

### Improve Design:
```
"Update [screen/component] design:
- Change [element] to [new style]
- Add [animation/effect]
- Match [reference design]
```

### Full Flow Testing:
```
"Test and fix the entire [flow name] flow:
1. [step 1] - currently [issue]
2. [step 2] - currently [issue]
3. [step 3] - currently [issue]
Ensure all steps work end-to-end."
```

---

## 🔧 Development Workflow Prompts

### When Expo Go Isn't Updating:
```
"Expo Go isn't showing my changes. I've tried:
- Restarting Metro bundler
- Clearing cache (npm start:clear)
- Reloading in Expo Go

The file I changed: [file path]
What I changed: [description]
```

### When Adding Dependencies:
```
"Add [package name] to the project:
- Install with expo install [package]
- Update [file] to use it
- Ensure it works with Expo SDK 54
```

### When Supabase Issues:
```
"Fix Supabase [table/function/policy]:
- Issue: [description]
- Error: [error message]
- Use Supabase MCP to check and fix
```

---

## 🎨 Design & UX Prompts

### Match UI/UX Spec:
```
"Update [screen] to match the UI/UX spec:
- [specific requirement from spec]
- Ensure [design element] matches
- Add [animation/interaction]
```

### Improve Empty States:
```
"Improve empty state for [screen]:
- Current: [what shows now]
- Should show: [what should show]
- Add [action button/animation]
```

---

## 🚀 Getting to Full Production

### Complete Feature Audit:
```
"Ultra-audit the entire app:
1. Test all user flows end-to-end
2. Fix any broken features
3. Ensure all Supabase policies are correct
4. Verify design matches UI/UX spec
5. Check for any missing features
6. Commit all fixes to GitHub"
```

### Performance Optimization:
```
"Optimize [screen/feature] performance:
- Current issue: [slow/glitchy]
- Measure: [what to measure]
- Fix: [specific optimizations]
```

### Production Readiness:
```
"Make the app production-ready:
1. Fix all bugs
2. Add error boundaries
3. Improve error messages
4. Add loading states
5. Test on iOS and Android
6. Update documentation
```

---

## 💡 Pro Tips

1. **Use @mentions**: `@LocationSearchScreen.tsx fix the search not working`

2. **Reference previous fixes**: "Like you did for [previous fix], fix [new issue]"

3. **Be iterative**: Start with one issue, then move to the next

4. **Include file paths**: Makes it faster for me to find the code

5. **Ask for explanations**: "Fix this and explain what was wrong"

---

## 🎯 Example Perfect Prompts

### Example 1: Bug Fix
```
"Fix post creation flow - when I press 'Share with Friends' in PostPreviewScreen, 
I get 'Failed to read image file' error. The file URI is valid (file:///...). 
Fix the file reading in src/services/posts.ts to work with Expo SDK 54."
```

### Example 2: Feature Addition
```
"Add exact location accuracy option to location settings:
- Add toggle in SettingsScreen for 'Use Exact Location'
- Update useLocation hook to support Location.Accuracy.Highest
- Update getCurrentLocationWithAddress to use highest accuracy when enabled
- Store preference in user_settings table"
```

### Example 3: Design Update
```
"Update FeedScreen header to match UI/UX spec:
- Replace hamburger menu with DiscoBallLogo on left
- Center 'Tonight' title
- Add avatar on right that navigates to Profile
- Use liquid glass effect from constants/liquidGlass.ts"
```

### Example 4: Full Audit
```
"Ultra-audit the entire app for production:
1. Test all flows: Auth → Feed → Post → Friends → Profile → Settings
2. Fix any broken features
3. Ensure Supabase has all required policies
4. Verify design matches the UI/UX spec document
5. Add any missing features from the spec
6. Commit everything to GitHub"
```

---

## 🆘 Emergency Fixes

### App Won't Start:
```
"App won't start - error: [error message]
I've tried: npm start, npm start:clear, deleting node_modules
Fix the issue and ensure it runs in Expo Go"
```

### Critical Bug:
```
"CRITICAL: [feature] is completely broken
- Users can't [do action]
- Error: [error]
- Fix immediately and test the entire flow"
```

---

## 📝 Remember

- **Be specific** - The more details, the better
- **Include errors** - Paste full error messages
- **Mention what you tried** - Saves time
- **Reference files** - Use @mentions or file paths
- **Ask for commits** - "Fix this and commit to GitHub"

I'm here to help you get this app to full production! 🎉

