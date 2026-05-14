"""
Test script to verify login fix works correctly
Run this after restarting the backend server:
    python backend/test_login_fix.py
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import engine
from app.models import User
from sqlalchemy import select
from sqlalchemy.orm import Session


def test_user_schema():
    """Test that User model has all required fields."""
    print("Testing User model schema...")
    
    with Session(engine) as db:
        # Get first user
        user = db.execute(select(User)).scalars().first()
        
        if not user:
            print("⚠️  No users found in database. Create a user first.")
            return False
        
        # Check all required fields exist
        required_fields = [
            'id', 'email', 'hashed_password', 'is_admin',
            'display_name', 'avatar_url', 'created_at',
            'two_factor_enabled', 'two_factor_method'
        ]
        
        missing_fields = []
        for field in required_fields:
            if not hasattr(user, field):
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ Missing fields in User model: {missing_fields}")
            return False
        
        print("✓ User model has all required fields")
        
        # Check field values
        print(f"\nUser data:")
        print(f"  - ID: {user.id}")
        print(f"  - Email: {user.email}")
        print(f"  - Display Name: {user.display_name or '(not set)'}")
        print(f"  - Is Admin: {user.is_admin}")
        print(f"  - 2FA Enabled: {user.two_factor_enabled}")
        print(f"  - 2FA Method: {user.two_factor_method or '(not set)'}")
        print(f"  - Created At: {user.created_at}")
        
        return True


def test_schema_import():
    """Test that schemas import correctly."""
    print("\nTesting schema imports...")
    
    try:
        from app.schemas import UserOut
        
        # Check UserOut has 2FA fields
        fields = UserOut.model_fields
        
        if 'two_factor_enabled' not in fields:
            print("❌ UserOut schema missing 'two_factor_enabled' field")
            return False
        
        if 'two_factor_method' not in fields:
            print("❌ UserOut schema missing 'two_factor_method' field")
            return False
        
        print("✓ UserOut schema has all required fields")
        return True
        
    except Exception as e:
        print(f"❌ Failed to import schemas: {e}")
        return False


def main():
    print("=" * 60)
    print("Login Fix Verification Test")
    print("=" * 60)
    print()
    
    # Test 1: Schema imports
    schema_ok = test_schema_import()
    
    # Test 2: User model
    model_ok = test_user_schema()
    
    print()
    print("=" * 60)
    if schema_ok and model_ok:
        print("✅ All tests passed!")
        print()
        print("Next steps:")
        print("1. Restart the backend server if it's running")
        print("2. Try logging in through the frontend")
        print("3. Login should work without internal server error")
    else:
        print("❌ Some tests failed. Check the output above.")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
