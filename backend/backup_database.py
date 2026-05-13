"""
Database backup utility
Run this script regularly (e.g., via cron job) to backup your database
"""
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path


def backup_database():
    """Create a backup of the SQLite database"""
    
    # Paths
    db_path = Path("data/app.db")
    backup_dir = Path("data/backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    if not db_path.exists():
        print(f"❌ Database not found: {db_path}")
        return False
    
    # Create backup filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"app_backup_{timestamp}.db"
    
    try:
        # Use SQLite backup API for safe backup
        source = sqlite3.connect(str(db_path))
        dest = sqlite3.connect(str(backup_path))
        
        with dest:
            source.backup(dest)
        
        source.close()
        dest.close()
        
        # Get file size
        size_mb = backup_path.stat().st_size / (1024 * 1024)
        
        print(f"✅ Backup created: {backup_path}")
        print(f"📊 Size: {size_mb:.2f} MB")
        
        # Clean old backups (keep last 30 days)
        cleanup_old_backups(backup_dir, days=30)
        
        return True
        
    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return False


def cleanup_old_backups(backup_dir: Path, days: int = 30):
    """Remove backups older than specified days"""
    import time
    
    cutoff = time.time() - (days * 86400)
    removed = 0
    
    for backup_file in backup_dir.glob("app_backup_*.db"):
        if backup_file.stat().st_mtime < cutoff:
            backup_file.unlink()
            removed += 1
            print(f"🗑️  Removed old backup: {backup_file.name}")
    
    if removed > 0:
        print(f"✅ Cleaned up {removed} old backup(s)")


def restore_database(backup_file: str):
    """Restore database from backup"""
    
    db_path = Path("data/app.db")
    backup_path = Path(backup_file)
    
    if not backup_path.exists():
        print(f"❌ Backup file not found: {backup_path}")
        return False
    
    try:
        # Create backup of current database before restoring
        if db_path.exists():
            current_backup = db_path.parent / f"app_before_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            shutil.copy2(db_path, current_backup)
            print(f"📦 Current database backed up to: {current_backup}")
        
        # Restore from backup
        shutil.copy2(backup_path, db_path)
        print(f"✅ Database restored from: {backup_path}")
        return True
        
    except Exception as e:
        print(f"❌ Restore failed: {e}")
        return False


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "restore":
        if len(sys.argv) < 3:
            print("Usage: python backup_database.py restore <backup_file>")
            sys.exit(1)
        restore_database(sys.argv[2])
    else:
        backup_database()
