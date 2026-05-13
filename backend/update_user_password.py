"""
Update user passwords
"""
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import hash_password
from app.config import settings

# Create engine
engine = create_engine(str(settings.database_url))
SessionLocal = sessionmaker(bind=engine)

def update_password(email: str, new_password: str):
    """Update a user's password"""
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if not user:
            print(f"❌ User {email} not found")
            return False
        
        user.hashed_password = hash_password(new_password)
        db.commit()
        print(f"✅ Updated password for {email}")
        return True
    finally:
        db.close()

def main():
    print("\n" + "="*60)
    print("Updating User Passwords")
    print("="*60 + "\n")
    
    # Update passwords for the users
    update_password("lakmihathnapitiya9@gmail.com", "HGlak@23562")
    update_password("deshanilakmi001@gmail.com", "HGlak@23562")
    
    print("\n" + "="*60)
    print("Password Update Complete")
    print("="*60)
    print("\nUpdated credentials:")
    print("  • lakmihathnapitiya9@gmail.com / HGlak@23562")
    print("  • deshanilakmi001@gmail.com / HGlak@23562")
    print("\n")

if __name__ == "__main__":
    main()
