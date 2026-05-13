# Logo Troubleshooting Guide

## Issue: Logo Not Updating

If the logo still doesn't look the same everywhere, follow these steps:

---

## Solution 1: Clear Cache and Restart (RECOMMENDED)

### Windows:
```bash
# Run this batch file:
RESTART_AND_CLEAR_CACHE.bat
```

### Manual Steps:
```bash
# 1. Stop dev server (Ctrl + C)

# 2. Delete cache folders
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# 3. Restart dev server
npm run dev

# 4. Hard refresh browser
# Press: Ctrl + Shift + R (Windows)
# Press: Cmd + Shift + R (Mac)
```

---

## Solution 2: Check Browser Cache

### Chrome/Edge:
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached Web Content"
3. Click "Clear Now"

---

## Solution 3: Verify Component Usage

All pages should use the same component:

```tsx
import BotLogo from "@/components/BotLogo";

// Then use it:
<BotLogo size={36} />
```

### Check these files:
- ✅ `src/views/ForgotPassword.tsx` - Uses `<BotLogo size={36} />`
- ✅ `src/views/Login.tsx` - Should use `<BotLogo size={36} />`
- ✅ `src/views/AdminLogin.tsx` - Should use `<BotLogo size={36} />`
- ✅ All other pages - Should use `<BotLogo size={36} />`

---

## Solution 4: Check Icon Files

The browser tab icons are separate files:

### Browser Favicon (32x32):
- File: `src/app/icon.tsx`
- Route: `/icon`
- Clear browser cache to see updates

### Apple Touch Icon (180x180):
- File: `src/app/apple-icon.tsx`
- Route: `/apple-icon`
- Clear browser cache to see updates

---

## Current Logo Specifications

### BotLogo Component:
```typescript
// Location: src/components/BotLogo.tsx
- Background: #7c87f8 (blue/purple)
- Icon: White microphone
- No glow effects
- Scalable SVG
```

### Design:
```
┌─────────────┐
│   Blue BG   │
│             │
│   ╭───╮     │  ← White capsule
│   │   │     │
│   ╰───╯     │
│    ╰─╯      │  ← U-shaped stand
│     │       │  ← Vertical base
└─────────────┘
```

---

## Verification Checklist

After clearing cache and restarting:

### 1. Check Forgot Password Page
- URL: http://localhost:3000/forgot-password
- Logo should be: Blue square with white microphone
- No glow effects

### 2. Check Login Page
- URL: http://localhost:3000/login
- Logo should match forgot password page exactly

### 3. Check Admin Login
- URL: http://localhost:3000/admin/login
- Logo should match forgot password page exactly

### 4. Check Dashboard
- URL: http://localhost:3000/dashboard
- Sidebar logo should match forgot password page exactly

### 5. Check Browser Tab
- Look at the favicon in the browser tab
- Should be blue square with white microphone

---

## If Still Not Working

### Check if dev server is running:
```bash
# You should see:
# ✓ Ready in X ms
# ○ Compiling / ...
```

### Check for errors:
```bash
# Look for any error messages in the terminal
# Common issues:
# - Port already in use
# - Syntax errors
# - Missing dependencies
```

### Force rebuild:
```bash
# Stop server
# Delete everything
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# Reinstall (if needed)
npm install

# Restart
npm run dev
```

---

## Expected Result

After following these steps, **ALL pages** should show:
- ✅ Blue/purple rounded square (#7c87f8)
- ✅ White microphone icon
- ✅ No glow effects
- ✅ Same design as forgot password page
- ✅ Consistent everywhere

---

## Technical Details

### Why caching happens:
1. **Next.js cache**: `.next` folder stores compiled pages
2. **Browser cache**: Browser stores images and icons
3. **Node cache**: `node_modules/.cache` stores build artifacts

### Why hard refresh is needed:
- Browser caches the icon files (`/icon`, `/apple-icon`)
- Regular refresh doesn't clear these
- Hard refresh (`Ctrl + Shift + R`) forces reload

---

## Quick Test

Run this in your browser console (F12):
```javascript
// Check if BotLogo component is loaded
console.log('Logo background:', 
  document.querySelector('[style*="7c87f8"]') ? 'Found' : 'Not found'
);
```

Should output: `Logo background: Found`

---

**Last Updated**: May 10, 2026
**Status**: Logo component updated, cache clearing required
**Action**: Run `RESTART_AND_CLEAR_CACHE.bat` and hard refresh browser
