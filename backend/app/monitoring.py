"""
Application monitoring and logging
"""
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


# Setup logging
LOG_DIR = Path("data/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Configure file handler
file_handler = logging.FileHandler(
    LOG_DIR / f"app_{datetime.now().strftime('%Y%m%d')}.log"
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(
    logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
)

# Configure console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(
    logging.Formatter('%(levelname)s: %(message)s')
)

# Get logger
logger = logging.getLogger("presentiq")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)


class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to log requests and monitor performance"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start timer
        start_time = time.time()
        
        # Get request info
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log request
            logger.info(
                f"{method} {path} - {response.status_code} - "
                f"{duration:.3f}s - IP: {client_ip}"
            )
            
            # Add performance header
            response.headers["X-Process-Time"] = f"{duration:.3f}"
            
            # Log slow requests
            if duration > 2.0:
                logger.warning(
                    f"SLOW REQUEST: {method} {path} took {duration:.3f}s"
                )
            
            return response
            
        except Exception as e:
            # Log error
            duration = time.time() - start_time
            logger.error(
                f"ERROR: {method} {path} - {str(e)} - "
                f"{duration:.3f}s - IP: {client_ip}",
                exc_info=True
            )
            raise


def log_security_event(event_type: str, details: dict):
    """Log security-related events"""
    logger.warning(
        f"SECURITY EVENT: {event_type} - {details}"
    )


def log_admin_action(admin_email: str, action: str, target: str = None):
    """Log admin actions for audit trail"""
    details = f"Admin: {admin_email} - Action: {action}"
    if target:
        details += f" - Target: {target}"
    logger.info(f"ADMIN ACTION: {details}")


def get_system_stats() -> dict:
    """Get system statistics"""
    import psutil
    
    return {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "timestamp": datetime.now().isoformat()
    }
