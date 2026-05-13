"""
Test all user logins
"""
import requests

BASE_URL = "http://localhost:8000"

test_users = [
    ("admin@test.com", "admin123", "Admin"),
    ("lakmihathnapitiya9@gmail.com", "password123", "User 1"),
    ("deshanilakmi001@gmail.com", "password123", "User 2"),
    ("user@test.com", "user123", "User 3"),
]

def test_login(email: str, password: str, name: str):
    print(f"\nTesting {name} ({email})...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Login successful!")
            print(f"  Token: {data['access_token'][:30]}...")
            print(f"  Is Admin: {data.get('is_admin', False)}")
        else:
            print(f"  ❌ Login failed: {response.status_code}")
            print(f"  Error: {response.text}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

def main():
    print("\n" + "="*60)
    print("Testing All User Logins")
    print("="*60)
    
    for email, password, name in test_users:
        test_login(email, password, name)
    
    print("\n" + "="*60)
    print("All Tests Complete")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
