# 🚀 How to Run the Project

## Quick Start (Easiest Method)

### Option 1: Run Both Servers at Once

**Using PowerShell:**
```powershell
.\start-both.ps1
```

**Using Command Prompt:**
```cmd
start-both.bat
```

This will open two terminal windows:
- Backend server on http://localhost:8000
- Frontend server on http://localhost:3000

---

## Manual Start (Run Separately)

### Start Backend Only

**Using PowerShell:**
```powershell
.\start-backend.ps1
```

**Using Command Prompt:**
```cmd
start-backend.bat
```

**Manual Commands:**
```bash
cd backend
.venv\Scripts\activate
python run.py
```

The backend will be available at: **http://localhost:8000**

---

### Start Frontend Only

**Using PowerShell:**
```powershell
.\start-frontend.ps1
```

**Using Command Prompt:**
```cmd
start-frontend.bat
```

**Manual Commands:**
```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## Alternative: Using Kiro (Current Method)

If you're using Kiro IDE, you can start the servers as background processes:

### Start Backend
```bash
backend/.venv/Scripts/python.exe backend/run.py
```

### Start Frontend
```bash
npm run dev
```

---

## First Time Setup

If this is your first time running the project:

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Setup Backend Virtual Environment
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Initialize Database
The database will be automatically created when you first run the backend.

---

## Verify Everything is Working

### Test Backend
```bash
curl http://localhost:8000/health
```

Expected response: `{"status":"ok"}`

### Test Frontend
Open your browser and go to: http://localhost:3000

### Test Proxy Connection
```bash
curl http://localhost:3000/api/proxy/health
```

Expected response: `{"status":"ok"}`

---

## Stop the Servers

### If using scripts:
- Press `Ctrl+C` in each terminal window
- Or simply close the terminal windows

### If using Kiro:
- Use Kiro to stop the background processes

---

## Troubleshooting

### Port Already in Use

**Backend (Port 8000):**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Frontend (Port 3000):**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Virtual Environment Not Found
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Node Modules Not Found
```bash
npm install
```

### Database Issues
Delete the database and restart:
```bash
# Delete database
rm data/app.db

# Restart backend - it will recreate the database
.\start-backend.ps1

# Recreate test users
backend/.venv/Scripts/python.exe backend/create_test_users.py
```

---

## Environment Variables

### Backend (.env)
Located at: `backend/.env`

Key settings:
```env
SECRET_KEY=replace-with-long-random-string
DATABASE_URL=sqlite:///./data/app.db
WHISPER_MODEL_SIZE=large-v3
WHISPER_DEVICE=cpu
MAX_UPLOAD_MB=1024
```

### Frontend (.env.local)
Located at: `.env.local`

Key settings:
```env
NEXT_PUBLIC_API_URL=/api/proxy
```

---

## Development Commands

### Backend

**Run with auto-reload:**
```bash
cd backend
.venv\Scripts\activate
python run.py
```

**Run tests:**
```bash
cd backend
.venv\Scripts\activate
pytest
```

**Check Python syntax:**
```bash
cd backend
.venv\Scripts\activate
python -m py_compile app/main.py
```

### Frontend

**Development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm run start
```

**Lint code:**
```bash
npm run lint
```

---

## API Documentation

Once the backend is running, you can access the interactive API documentation:

**Swagger UI:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc

---

## Login Credentials

After starting the servers, you can login with:

**Your Account:**
- Email: `lakmihathnapitiya9@gmail.com`
- Password: `HGlak@23562`

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start both servers | `.\start-both.ps1` or `start-both.bat` |
| Start backend only | `.\start-backend.ps1` or `start-backend.bat` |
| Start frontend only | `.\start-frontend.ps1` or `start-frontend.bat` |
| Stop servers | Press `Ctrl+C` in terminal |
| View backend logs | Check backend terminal window |
| View frontend logs | Check frontend terminal window |
| Access frontend | http://localhost:3000 |
| Access backend | http://localhost:8000 |
| Access API docs | http://localhost:8000/docs |

---

## Next Steps

1. **Start the servers** using one of the methods above
2. **Open your browser** and go to http://localhost:3000
3. **Login** with the credentials above
4. **Start using** the Speech Pronunciation Assessment System!

---

## Need Help?

- Check the terminal logs for error messages
- Verify both servers are running
- Check the browser console for frontend errors
- Review the API documentation at http://localhost:8000/docs
- Read PROJECT_RUNNING_STATUS.md for detailed documentation
