# 🚀 Quick Start Guide

## Current Status: ✅ RUNNING

Both servers are currently running and ready to use!

---

## 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ Running |
| **Backend API** | http://localhost:8000 | ✅ Running |
| **API Docs** | http://localhost:8000/docs | ✅ Available |

---

## 👤 Login Credentials

### Quick Test Account
```
Email: admin@test.com
Password: admin123
```

### Your Accounts
```
Email: lakmihathnapitiya9@gmail.com
Password: HGlak@23562

Email: deshanilakmi001@gmail.com
Password: HGlak@23562
```

---

## 🎯 Quick Actions

### 1. Access the Application
```
1. Open browser
2. Go to: http://localhost:3000
3. Click "Sign In"
4. Enter credentials above
5. Start using the app!
```

### 2. Test Pronunciation Analysis
```
1. Login to the application
2. Click "Start Practice" or "New Session"
3. Upload an audio file (WAV, MP3, etc.)
4. Wait for analysis (30-60 seconds)
5. View your pronunciation scores and feedback
```

### 3. View Admin Dashboard
```
1. Login as admin@test.com
2. Click on your profile icon
3. Select "Admin Dashboard"
4. View statistics, users, and sessions
```

---

## 🔧 Server Management

### Check Server Status
Both servers are currently running:
- Backend: Terminal ID 2
- Frontend: Terminal ID 4

### View Logs
Ask Kiro to show process output for Terminal 2 or 4

### Restart Servers (if needed)
```bash
# Stop current processes first, then:

# Backend
backend/.venv/Scripts/python.exe backend/run.py

# Frontend
npm run dev
```

---

## 📊 What You Can Do Now

### As Regular User:
- ✅ Upload audio files for pronunciation analysis
- ✅ View detailed scoring and feedback
- ✅ Track progress over time
- ✅ Update profile and avatar
- ✅ Submit feedback about the platform

### As Admin:
- ✅ View all users and sessions
- ✅ Monitor system health
- ✅ Manage user feedback
- ✅ View analytics and statistics
- ✅ Configure feature toggles

---

## 🎤 Sample Audio Files

For testing, you can:
1. Record your own voice reading a sentence
2. Use any WAV, MP3, or M4A audio file
3. Keep files under 1GB (configurable)
4. Recommended: 10-60 seconds of speech

---

## 🐛 Troubleshooting

### Can't Access Frontend?
- Check if http://localhost:3000 is accessible
- Verify Terminal 4 shows "Ready in XXXms"

### Can't Login?
- Use exact credentials from above
- Check browser console for errors
- Verify backend is running (Terminal 2)

### Upload Not Working?
- Check file size (max 1GB)
- Verify file format (WAV, MP3, M4A, etc.)
- Check backend logs for errors

---

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## 💡 Tips

1. **First Time?** Start with the admin account to explore all features
2. **Testing?** Use short audio clips (10-30 seconds) for faster results
3. **Slow Analysis?** The Whisper Large-V3 model is accurate but slower on CPU
4. **Dark Mode?** Toggle in the top-right corner of the app

---

## 🎉 You're All Set!

The project is fully operational and ready for:
- ✅ Development
- ✅ Testing
- ✅ Demonstration
- ✅ User Acceptance Testing

**Next Step:** Open http://localhost:3000 and start exploring!
