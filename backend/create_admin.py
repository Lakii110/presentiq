"""
Run this once to create your admin account:
  cd backend
  .venv\Scripts\activate
  python create_admin.py
"""
from app.database import SessionLocal, Base, engine
from app.models import User
from app.auth import hash_password
from sqlalchemy import select

Base.metadata.create_all(bind=engine)

ADMIN_EMAIL = "lakmihathnapitiya@gmail.com"
ADMIN_PASSWORD = "admin@123"

db = SessionLocal()
existing = db.execute(select(User).where(User.email == ADMIN_EMAIL)).scalar_one_or_none()

if existing:
    existing.is_admin = True
    existing.hashed_password = hash_password(ADMIN_PASSWORD)
    db.commit()
    print(f"Updated {ADMIN_EMAIL} -> admin access granted.")
else:
    admin = User(email=ADMIN_EMAIL, hashed_password=hash_password(ADMIN_PASSWORD), is_admin=True)
    db.add(admin)
    db.commit()
    print(f"Admin account created: {ADMIN_EMAIL}")

print("Login at: http://localhost:3000/admin/login")
db.close()
