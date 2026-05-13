"""
Rate limiting middleware to prevent brute force attacks
"""
import time
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests: int = 5, window: int = 60):
        """
        Args:
            requests: Maximum number of requests allowed
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window
        self.clients: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if client is allowed to make request"""
        now = time.time()
        
        # Clean old requests
        self.clients[client_id] = [
            req_time for req_time in self.clients[client_id]
            if now - req_time < self.window
        ]
        
        # Check if limit exceeded
        if len(self.clients[client_id]) >= self.requests:
            return False
        
        # Add current request
        self.clients[client_id].append(now)
        return True
    
    def get_retry_after(self, client_id: str) -> int:
        """Get seconds until client can retry"""
        if not self.clients[client_id]:
            return 0
        oldest = min(self.clients[client_id])
        return int(self.window - (time.time() - oldest)) + 1


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to apply rate limiting"""
    
    def __init__(self, app, requests: int = 100, window: int = 60):
        super().__init__(app)
        self.limiter = RateLimiter(requests, window)
        # Stricter limits for auth endpoints
        self.auth_limiter = RateLimiter(requests=5, window=60)
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Apply stricter limits to auth endpoints
        if request.url.path.startswith("/auth/login") or request.url.path.startswith("/auth/signup"):
            if not self.auth_limiter.is_allowed(client_ip):
                retry_after = self.auth_limiter.get_retry_after(client_ip)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many login attempts. Try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)}
                )
        else:
            # General rate limit
            if not self.limiter.is_allowed(client_ip):
                retry_after = self.limiter.get_retry_after(client_ip)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)}
                )
        
        response = await call_next(request)
        return response
