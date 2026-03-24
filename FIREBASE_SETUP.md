# Firebase Setup Guide 🚀

## Quick Setup Steps (5 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Project name: `sbi-study-agent`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### 3. Enable Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode"
4. Select location (choose closest to you)
5. Click "Create database"

### 4. Get Your Configuration
1. Go to Project Settings (gear icon ⚙️)
2. Scroll to "Your apps" section
3. Click "Web app" (</> icon)
4. Copy the firebaseConfig object

### 5. Update Your .env File
Replace the placeholder values in your `.env` file with your REAL Firebase credentials:

```env
# Firebase Configuration - PASTE YOUR REAL VALUES HERE
VITE_FIREBASE_API_KEY=AIzaSyC1Xl2x3y4z5abc123def456ghi789
VITE_FIREBASE_AUTH_DOMAIN=your-project-name.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-name-12345
VITE_FIREBASE_STORAGE_BUCKET=your-project-name-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123DEF456
```

### 6. Restart Your App
```bash
npm run dev
```

## 🔍 Where to Find Each Value

### API Key
- Firebase Console → Project Settings → General → Your apps → Web app → apiKey

### Auth Domain
- Usually: `your-project-name.firebaseapp.com`

### Project ID
- Firebase Console → Project Settings → General → Project ID

### Storage Bucket
- Usually: `your-project-name.appspot.com`

### Messaging Sender ID
- Firebase Console → Project Settings → Cloud Messaging → Sender ID

### App ID
- Firebase Console → Project Settings → General → Your apps → App ID

### Measurement ID
- Firebase Console → Project Settings → General → Your apps → Measurement ID

## ✅ Test Your Setup

After updating your `.env` file:

1. **Save the file**
2. **Restart dev server**: `npm run dev`
3. **Open browser console** - you should see: `✅ Firebase initialized successfully`
4. **Test authentication**: Try signing up with any email/password

## 🆘 Troubleshooting

### Still getting API key error?
- Make sure you copied the EXACT values (no typos)
- Check that you're using `VITE_` prefix for all variables
- Restart your dev server after changing .env

### Can't find your project?
- Make sure you created a Firebase project first
- Check you're in the correct Google account
- Try creating a new Web app in Project Settings

## 🎯 Success Indicators

When setup is complete, you'll see:
- ✅ No more API key errors
- ✅ Firebase initialized successfully in console
- ✅ Email/password forms work
- ✅ Users can sign up and sign in

---

**Need help?** Check Firebase's official docs: https://firebase.google.com/docs/web/setup
