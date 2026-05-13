"""
Test login with updated password
"""
import requests

BASE_URL = "http://localhost:8000"

def test_login(email: str, password: str):
    print(f"\nTesting login for {email}...")
    print(f"Password: {password}")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
    else:
        print("❌ Login failed!")

def main():
    print("\n" + "="*60)
    print("Testing Updated Logins")
    print("="*60)
    
    test_login("lakmihathnapitiya9@gmail.com", "HGlak@23562")
    test_login("deshanilakmi001@gmail.com", "HGlak@23562")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
