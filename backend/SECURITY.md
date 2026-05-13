# Security Guidelines

## ⚠️ IMPORTANT: Default Credentials

**DO NOT use default credentials in production!**

### Creating Admin User

To create an admin user, use the `create_admin.py` script:

```bash
cd backend
python create_admin.py
```

This will prompt you to enter:
- Email address
- Secure password (minimum 8 characters)
- Display name

### Password Requirements

- Minimum 8 characters
- Use strong, unique passwords
- Never reuse passwords
- Consider using a password manager

### Security Best Practices

1. **Change the secret key** in `backend/.env`:
   ```
   SECRET_KEY=your-secure-random-key-here
   ```

2. **Use environment variables** for sensitive data

3. **Enable HTTPS** in production

4. **Regular security updates** - keep dependencies updated

5. **Monitor logs** for suspicious activity

6. **Backup database** regularly

## Rate Limiting

The API has rate limiting enabled:
- **General endpoints:** 100 requests per minute per IP
- **Login/Signup:** 5 attempts per minute per IP

## Reporting Security Issues

If you discover a security vulnerability, please email: security@presentiq.com

**Do not** create public GitHub issues for security vulnerabilities.
