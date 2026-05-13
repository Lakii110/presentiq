"""
Script to check users in the database and test password verification
"""
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import verify_password, hash_password
from app.config import settings

# Create engine
engine = create_engine(str(settings.database_url))
SessionLocal = sessionmaker(bind=engine)

def main():
    db = SessionLocal()
    try:
        # Get all users
        users = db.execute(select(User)).scalars().all()
        
        print(f"\n{'='*60}")
        print(f"Total users in database: {len(users)}")
        print(f"{'='*60}\n")
        
        if not users:
            print("No users found in database!")
            print("\nCreating a test admin user...")
            print("Email: admin@test.com")
            print("Password: admin123")
            
            test_user = User(
                email="admin@test.com",
                hashed_password=hash_password("admin123"),
                is_admin=True,
                display_name="Admin User"
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print(f"\n✅ Test admin user created with ID: {test_user.id}")
            
            # Verify the password works
            if verify_password("admin123", test_user.hashed_password):
                print("✅ Password verification works correctly!")
            else:
                print("❌ Password verification failed!")
        else:
            for user in users:
                print(f"User ID: {user.id}")
                print(f"Email: {user.email}")
                print(f"Is Admin: {user.is_admin}")
                print(f"Display Name: {user.display_name or '(not set)'}")
                print(f"Created: {user.created_at}")
                print(f"Hashed Password (first 50 chars): {user.hashed_password[:50]}...")
                print("-" * 60)
                
                # Test password verification with common passwords
                test_passwords = ["password", "admin123", "test123", "12345678"]
                print("\nTesting common passwords:")
                for pwd in test_passwords:
                    if verify_password(pwd, user.hashed_password):
                        print(f"  ✅ Password '{pwd}' matches!")
                        break
                else:
                    print("  ❌ None of the common passwords match")
                print()
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
