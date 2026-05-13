import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import auth, sessions, admin
from app.routers import password_reset, feedback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    Path("data/avatars").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    logger.info("Database ready at %s", settings.database_url)
    yield


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now to test
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Debug: Log CORS origins
logger.info("CORS configured: allow_origins=* (all origins allowed for testing)")

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(admin.router)
app.include_router(password_reset.router)
app.include_router(feedback.router)

# Serve uploaded avatars — directory is created in lifespan before this runs
_avatar_dir = Path("data/avatars")
_avatar_dir.mkdir(parents=True, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=str(_avatar_dir)), name="avatars")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
