# Firebase Login Fix - Step by Step

## The Problem
Your spending tracker has a fake/truncated Firebase API key:
```
apiKey: "AIzaSy...OOAw"  // This is NOT real
```
You need a real Firebase config to enable Google Sign-In.

---

## Step 1: Open Firebase Console
Go to: https://console.firebase.google.com

---

## Step 2: Create or Select Project
- If you already have a project called "spending-tracker-a9a94" → select it
- If not → click "Add project" → name it "spending-tracker" → follow prompts

---

## Step 3: Enable Google Sign-In
1. In Firebase console → left menu → Build → Authentication → Get started
2. Click "Add sign-in method"
3. Select "Google" → toggle to Enable
4. Select your email in the "Project support email" dropdown
5. Click Save

---

## Step 4: Add Your Domain as Authorized
1. In Authentication → click "Settings" (top right)
2. Scroll to "Authorized domains"
3. Click "Add domain"
4. Enter: `baauum.github.io`
5. Click Add

---

## Step 5: Get Your Real Firebase Config
1. Click the gear icon (Project Settings) top left
2. Scroll down to "Your apps"
3. Click Web app (</>) or add one if missing
4. Copy the `firebaseConfig` object that looks like:
```
apiKey: "REAL_KEY_HERE",
authDomain: "your-project.firebaseapp.com",
projectId: "your-project-id",
storageBucket: "your-project.appspot.com",
messagingSenderId: "123456789",
appId: "1:123456789:web:abc123"
```

---

## Step 6: Update Your Code
1. Open index.html in your spending-tracker repo
2. Find lines ~374-381 (the firebaseConfig block)
3. Replace the fake values with your real Firebase config
4. Commit and push to GitHub

---

## Step 7: Redeploy
If using GitHub Pages - push to main branch, it redeploys automatically in ~1-2 min.

---

## Test
Visit: https://baauum.github.io/spending-tracker/
Click "Sign in with Google" → should work now