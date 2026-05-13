# PresentIQ backend (FastAPI)

## Setup

1. Install [Python 3.12+](https://www.python.org/downloads/) and [FFmpeg](https://ffmpeg.org/) (required for many audio formats).
2. From this folder:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set a strong `SECRET_KEY`.

## Run

```bash
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --timeout-keep-alive 600
```

For large file uploads (10+ minute recordings), the `--timeout-keep-alive 600` flag prevents the connection from being dropped during upload.

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

SQLite DB and uploads are stored under `backend/data/` (gitignored).

## Typical flow

1. `POST /auth/register` then `POST /auth/login` → Bearer token.  
2. `POST /sessions` with body `{"mode":"practice"}` → `session_id`.  
3. `POST /sessions/{id}/audio` with multipart file → processing starts in the background.  
4. Poll `GET /sessions/{id}/analysis` until HTTP 200 (or 202 while processing).

## Frontend (Vite app in repo root)

Copy the root `.env.example` to `.env.local` and set `VITE_API_URL=http://localhost:8000`. The React app calls this API for login, signup, upload/record, and the analysis page (`?session=`).
