# 🚀 Run Commands - Quick Reference

## 🎯 Easiest Way to Run (ONE COMMAND!)

### Windows Command Prompt
```cmd
RUN_PROJECT.bat
```

### PowerShell
```powershell
.\RUN_PROJECT.ps1
```

**This will:**
1. ✅ Start the backend server
2. ✅ Start the frontend server
3. ✅ Open your browser automatically
4. ✅ Show you the login credentials

---

## 📋 All Available Scripts

### Complete Launchers (Recommended)
| File | Description |
|------|-------------|
| `RUN_PROJECT.bat` | **ONE-CLICK LAUNCHER** - Starts everything and opens browser |
| `RUN_PROJECT.ps1` | PowerShell version of the launcher |

### Individual Server Scripts
| File | Description |
|------|-------------|
| `start-both.bat` | Start both servers in separate windows |
| `start-both.ps1` | PowerShell version |
| `start-backend.bat` | Start only backend server |
| `start-backend.ps1` | PowerShell version |
| `start-frontend.bat` | Start only frontend server |
| `start-frontend.ps1` | PowerShell version |

---

## 🎮 Usage Examples

### Example 1: Quick Start (Recommended)
```cmd
RUN_PROJECT.bat
```
- Opens 2 terminal windows (backend + frontend)
- Opens browser automatically
- Shows login credentials

### Example 2: Start Both Servers
```cmd
start-both.bat
```
- Opens 2 terminal windows
- Doesn't open browser automatically

### Example 3: Start Backend Only
```cmd
start-backend.bat
```
- Useful for API testing
- Access at http://localhost:8000

### Example 4: Start Frontend Only
```cmd
start-frontend.bat
```
- Useful for UI development
- Access at http://localhost:3000

---

## 💻 Manual Commands

### Backend
```bash
cd backend
.venv\Scripts\activate
python run.py
```

### Frontend
```bash
npm run dev
```

---

## 🔑 Login Credentials

After starting the servers:

**Your Account:**
```
Email:    lakmihathnapitiya9@gmail.com
Password: HGlak@23562
```

**Admin Account:**
```
Email:    admin@test.com
Password: admin123
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |

---

## 🛑 How to Stop

1. **Close the terminal windows**, or
2. **Press Ctrl+C** in each terminal

---

## ⚡ Quick Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 8000 (backend)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Virtual Environment Not Found?
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Node Modules Not Found?
```bash
npm install
```

---

## 📚 More Information

- **Complete Guide:** Read `HOW_TO_RUN.md`
- **System Status:** Read `PROJECT_RUNNING_STATUS.md`
- **Quick Start:** Read `QUICK_START_GUIDE.md`
- **Credentials:** Read `TEST_CREDENTIALS.txt`

---

## 🎉 That's It!

Just run `RUN_PROJECT.bat` and you're ready to go!

The browser will open automatically at http://localhost:3000

Login with your credentials and start using the Speech Pronunciation Assessment System! 🚀
