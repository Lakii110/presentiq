"""
Test the login endpoint directly
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    print("\n" + "="*60)
    print("Testing Login Endpoint")
    print("="*60 + "\n")
    
    # Test credentials
    email = "admin@test.com"
    password = "admin123"
    
    print(f"Attempting login with:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print()
    
    # Make login request
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    print()
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"Access Token: {data.get('access_token', 'N/A')[:50]}...")
        print(f"Is Admin: {data.get('is_admin', False)}")
    else:
        print("❌ Login failed!")
        try:
            error = response.json()
            print(f"Error: {error.get('detail', 'Unknown error')}")
        except:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    test_login()
