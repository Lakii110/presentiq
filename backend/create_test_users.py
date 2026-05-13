"""
Create test users for the application
"""
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import hash_password
from app.config import settings

# Create engine
engine = create_engine(str(settings.database_url))
SessionLocal = sessionmaker(bind=engine)

def create_user(email: str, password: str, is_admin: bool = False, display_name: str = None):
    """Create a user if they don't exist"""
    db = SessionLocal()
    try:
        # Check if user exists
        existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if existing:
            print(f"❌ User {email} already exists (ID: {existing.id})")
            return existing
        
        # Create new user
        user = User(
            email=email,
            hashed_password=hash_password(password),
            is_admin=is_admin,
            display_name=display_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created user: {email} (ID: {user.id}, Admin: {is_admin})")
        return user
    finally:
        db.close()

def main():
    print("\n" + "="*60)
    print("Creating Test Users")
    print("="*60 + "\n")
    
    # Create admin user
    create_user(
        email="admin@test.com",
        password="admin123",
        is_admin=True,
        display_name="Admin User"
    )
    
    # Create the users that were trying to login
    create_user(
        email="lakmihathnapitiya9@gmail.com",
        password="password123",
        is_admin=False,
        display_name="Lakmihath Napitiya"
    )
    
    create_user(
        email="deshanilakmi001@gmail.com",
        password="password123",
        is_admin=False,
        display_name="Deshani Lakmi"
    )
    
    # Create a few more test users
    create_user(
        email="user@test.com",
        password="user123",
        is_admin=False,
        display_name="Test User"
    )
    
    print("\n" + "="*60)
    print("User Creation Complete")
    print("="*60)
    print("\nYou can now login with:")
    print("  • admin@test.com / admin123 (Admin)")
    print("  • lakmihathnapitiya9@gmail.com / password123")
    print("  • deshanilakmi001@gmail.com / password123")
    print("  • user@test.com / user123")
    print("\n")

if __name__ == "__main__":
    main()
