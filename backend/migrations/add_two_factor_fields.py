"""
Migration: Add two_factor_enabled and two_factor_method fields to users table

Run this script to add the new fields to existing database:
    python backend/migrations/add_two_factor_fields.py
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.database import engine


def migrate():
    """Add two_factor_enabled and two_factor_method columns to users table."""
    with engine.connect() as conn:
        # For SQLite, check if columns exist by querying PRAGMA
        result = conn.execute(text("PRAGMA table_info(users)"))
        existing_columns = {row[1] for row in result}
        
        # Add two_factor_enabled if it doesn't exist
        if 'two_factor_enabled' not in existing_columns:
            print("Adding two_factor_enabled column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT 0
            """))
            conn.commit()
            print("✓ Added two_factor_enabled column")
        else:
            print("✓ two_factor_enabled column already exists")
        
        # Add two_factor_method if it doesn't exist
        if 'two_factor_method' not in existing_columns:
            print("Adding two_factor_method column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN two_factor_method VARCHAR(64)
            """))
            conn.commit()
            print("✓ Added two_factor_method column")
        else:
            print("✓ two_factor_method column already exists")
        
        print("\n✅ Migration completed successfully!")


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)
