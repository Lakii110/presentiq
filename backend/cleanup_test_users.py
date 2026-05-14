"""
Cleanup script to remove test users from the database

This script will remove users with test/dummy email addresses:
- Emails containing "test"
- Emails from example.com domain
- Emails containing "check", "smoke", "dummy", etc.

Run this script:
    python backend/cleanup_test_users.py
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import select, delete
from app.database import engine, SessionLocal
from app.models import User


def is_test_email(email: str) -> bool:
    """Check if an email looks like a test/dummy account."""
    email_lower = email.lower()
    
    # Patterns that indicate test accounts
    test_patterns = [
        'test',
        'example.com',
        'check',
        'smoke',
        'dummy',
        'fake',
        'demo',
    ]
    
    return any(pattern in email_lower for pattern in test_patterns)


def cleanup_test_users(dry_run: bool = True):
    """Remove test users from the database."""
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.execute(select(User)).scalars().all()
        
        print("=" * 70)
        print("Test User Cleanup Script")
        print("=" * 70)
        print()
        
        # Identify test users
        test_users = []
        real_users = []
        
        for user in users:
            if is_test_email(user.email):
                test_users.append(user)
            else:
                real_users.append(user)
        
        # Display summary
        print(f"Found {len(users)} total users:")
        print(f"  - {len(real_users)} real users")
        print(f"  - {len(test_users)} test users")
        print()
        
        if test_users:
            print("Test users to be removed:")
            for user in test_users:
                admin_badge = " [ADMIN]" if user.is_admin else ""
                print(f"  - {user.email:40s} (ID: {user.id}){admin_badge}")
            print()
        
        if real_users:
            print("Real users to be kept:")
            for user in real_users:
                admin_badge = " [ADMIN]" if user.is_admin else ""
                print(f"  - {user.email:40s} (ID: {user.id}){admin_badge}")
            print()
        
        # Perform cleanup
        if dry_run:
            print("=" * 70)
            print("DRY RUN MODE - No changes made")
            print("=" * 70)
            print()
            print("To actually delete test users, run:")
            print("    python backend/cleanup_test_users.py --confirm")
        else:
            if not test_users:
                print("No test users to remove.")
                return
            
            print("=" * 70)
            print("DELETING TEST USERS...")
            print("=" * 70)
            
            for user in test_users:
                print(f"Deleting: {user.email} (ID: {user.id})")
                db.delete(user)
            
            db.commit()
            
            print()
            print(f"✅ Successfully deleted {len(test_users)} test users")
            print()
            
            # Verify
            remaining = db.execute(select(User)).scalars().all()
            print(f"Remaining users: {len(remaining)}")
            for user in remaining:
                admin_badge = " [ADMIN]" if user.is_admin else ""
                print(f"  - {user.email}{admin_badge}")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Check for --confirm flag
    confirm = "--confirm" in sys.argv
    
    try:
        cleanup_test_users(dry_run=not confirm)
    except Exception as e:
        print(f"\n❌ Cleanup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
