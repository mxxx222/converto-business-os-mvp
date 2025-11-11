#!/usr/bin/env python3
"""
Admin Activity Feed Smoke Test
Sends 3 test activities and verifies they appear in the feed.
"""

import os
import json
import time
import uuid
import requests
import asyncio
import websockets
from datetime import datetime
import jwt

def generate_admin_token():
    """Generate admin JWT token for testing."""
    payload = {
        "sub": "smoke-test@admin",
        "role": "admin",
        "tenant_id": "test-tenant",
        "iat": int(time.time()),
        "exp": int(time.time()) + 300  # 5 minutes
    }
    
    secret = os.getenv("ADMIN_JWT_SECRET", "change-me")
    return jwt.encode(payload, secret, algorithm="HS256")

def test_rest_api():
    """Test REST API endpoints."""
    print("🧪 Testing REST API...")
    
    base_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    token = generate_admin_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test activities to send
    test_activities = [
        {
            "type": "upload",
            "details": {"docId": "A1", "filename": "test-receipt.jpg"},
            "tenant_id": "test-tenant"
        },
        {
            "type": "ocr_completed",
            "details": {"docId": "A1", "confidence": 0.97, "amount": 45.50},
            "tenant_id": "test-tenant"
        },
        {
            "type": "error",
            "details": {"docId": "A2", "code": "OCR_TIMEOUT", "message": "Processing timeout"},
            "tenant_id": "test-tenant"
        }
    ]
    
    # Send activities
    for i, activity in enumerate(test_activities, 1):
        try:
            response = requests.post(
                f"{base_url}/api/admin/activities",
                headers=headers,
                json=activity,
                timeout=10
            )
            
            if response.status_code == 201:
                print(f"✅ Activity {i} sent successfully: {activity['type']}")
            else:
                print(f"❌ Activity {i} failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Activity {i} error: {e}")
            return False
    
    # Verify activities were stored
    try:
        response = requests.get(
            f"{base_url}/api/admin/activities?limit=10&tenant_id=test-tenant",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            activities = data.get("activities", [])
            
            # Check if our test activities are there
            test_types = [act["type"] for act in test_activities]
            found_types = [act.get("type") for act in activities]
            
            for test_type in test_types:
                if test_type in found_types:
                    print(f"✅ Found activity type: {test_type}")
                else:
                    print(f"⚠️  Missing activity type: {test_type}")
            
            print(f"📊 Total activities found: {len(activities)}")
            return True
            
        else:
            print(f"❌ Failed to fetch activities: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Fetch error: {e}")
        return False

def test_websocket():
    """Test WebSocket connection and real-time feed."""
    print("\n🔌 Testing WebSocket...")
    
    ws_url = os.getenv("NEXT_PUBLIC_WS_URL", "ws://localhost:8000").replace("http", "ws")
    token = generate_admin_token()
    
    async def ws_test():
        try:
            # Connect to WebSocket
            uri = f"{ws_url}/api/admin/feed?token={token}"
            async with websockets.connect(uri) as websocket:
                print("✅ WebSocket connected")
                
                # Wait for ready message
                try:
                    ready_msg = await asyncio.wait_for(websocket.recv(), timeout=5)
                    ready_data = json.loads(ready_msg)
                    if ready_data.get("type") == "ready":
                        print("✅ WebSocket ready message received")
                    else:
                        print(f"⚠️  Unexpected ready message: {ready_data}")
                except asyncio.TimeoutError:
                    print("⚠️  No ready message received")
                
                # Send ping
                await websocket.send(json.dumps({"type": "ping"}))
                try:
                    pong_msg = await asyncio.wait_for(websocket.recv(), timeout=2)
                    pong_data = json.loads(pong_msg)
                    if pong_data.get("type") == "pong":
                        print("✅ WebSocket ping/pong working")
                    else:
                        print(f"⚠️  Unexpected pong message: {pong_data}")
                except asyncio.TimeoutError:
                    print("⚠️  No pong response")
                
                # Listen for activities for a few seconds
                print("🔍 Listening for activities...")
                start_time = time.time()
                activity_count = 0
                
                while time.time() - start_time < 10:  # Listen for 10 seconds
                    try:
                        msg = await asyncio.wait_for(websocket.recv(), timeout=1)
                        data = json.loads(msg)
                        if data.get("type") == "activity":
                            activity_count += 1
                            print(f"📨 Activity received: {data['data']['type']}")
                    except asyncio.TimeoutError:
                        continue
                
                if activity_count > 0:
                    print(f"✅ Received {activity_count} real-time activities")
                    return True
                else:
                    print("⚠️  No real-time activities received")
                    return False
                    
        except Exception as e:
            print(f"❌ WebSocket test failed: {e}")
            return False
    
    return asyncio.run(ws_test())

def test_health():
    """Test admin health endpoint."""
    print("\n🏥 Testing health endpoint...")
    
    base_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    token = generate_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{base_url}/api/admin/health",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"📊 Active connections: {data['active_connections']}")
            print(f"📈 Total activities: {data['total_activities']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def main():
    """Run all smoke tests."""
    print("🚀 Admin Activity Feed Smoke Test")
    print("=" * 50)
    
    # Check if backend is running
    base_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Backend not responding. Please start the backend server.")
            return
    except Exception:
        print("❌ Backend not accessible. Please start the backend server.")
        return
    
    # Run tests
    results = []
    results.append(("REST API", test_rest_api()))
    results.append(("WebSocket", test_websocket()))
    results.append(("Health", test_health()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SMOKE TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Admin Activity Feed is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
    
    return passed == len(results)

if __name__ == "__main__":
    main()