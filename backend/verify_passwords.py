"""
Verify all user passwords
"""
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import verify_password
from app.config import settings

engine = create_engine(str(settings.database_url))
SessionLocal = sessionmaker(bind=engine)

def main():
    db = SessionLocal()
    try:
        users = db.execute(select(User)).scalars().all()
        
        print("\n" + "="*60)
        print("PASSWORD VERIFICATION")
        print("="*60 + "\n")
        
        # Test credentials
        test_creds = [
            ("admin@test.com", "admin123"),
            ("lakmihathnapitiya9@gmail.com", "HGlak@23562"),
            ("deshanilakmi001@gmail.com", "HGlak@23562"),
            ("user@test.com", "user123"),
        ]
        
        for email, password in test_creds:
            user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
            if user:
                if verify_password(password, user.hashed_password):
                    print(f"✅ {email}")
                    print(f"   Password: {password}")
                else:
                    print(f"❌ {email}")
                    print(f"   Password '{password}' does NOT match!")
            else:
                print(f"❌ {email} - User not found!")
            print()
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
