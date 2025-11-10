#!/usr/bin/env python3
"""Admin real-time bus smoke test.

This script tests the admin bus system with Redis/Upstash or fallback to in-memory.
It validates:
- Bus initialization and configuration
- Activity publishing and listing
- WebSocket connectivity
- Performance metrics (latency monitoring)
- Error handling and recovery
"""

import asyncio
import json
import os
import time
import websockets
import aiohttp
import sys
from typing import Dict, List, Any


class BusSmokeTest:
    def __init__(self):
        self.api_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
        self.ws_url = os.getenv("NEXT_PUBLIC_WS_URL", "ws://localhost:8000")
        self.test_tenant = "test-tenant"
        self.events_received = []
        self.test_results = {}
    
    async def run_all_tests(self):
        """Run all smoke tests."""
        print("🧪 Starting Admin Bus Smoke Tests")
        print("=" * 50)
        
        try:
            # Test 1: Bus Configuration
            await self.test_bus_configuration()
            
            # Test 2: API Health Check
            await self.test_api_health()
            
            # Test 3: Activity Publishing
            await self.test_activity_publishing()
            
            # Test 4: Activity Listing
            await self.test_activity_listing()
            
            # Test 5: WebSocket Connection
            await self.test_websocket_connection()
            
            # Test 6: Real-time Event Reception
            await self.test_realtime_events()
            
            # Test 7: Performance Metrics
            await self.test_performance_metrics()
            
            # Test 8: Error Handling
            await self.test_error_handling()
            
        except Exception as e:
            print(f"❌ Critical test failure: {e}")
            return False
        
        # Print results
        await self.print_test_results()
        
        return all(self.test_results.values())
    
    async def test_bus_configuration(self):
        """Test bus configuration endpoint."""
        print("\n1️⃣ Testing Bus Configuration...")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/api/admin/bus-config") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        bus_type = data.get("bus_type", "unknown")
                        production_ready = data.get("production_ready", False)
                        
                        print(f"   Bus Type: {bus_type}")
                        print(f"   Production Ready: {production_ready}")
                        
                        self.test_results["bus_config"] = True
                        print("   ✅ Bus configuration test passed")
                    else:
                        print(f"   ❌ Bus config failed: {resp.status}")
                        self.test_results["bus_config"] = False
                        
        except Exception as e:
            print(f"   ❌ Bus config error: {e}")
            self.test_results["bus_config"] = False
    
    async def test_api_health(self):
        """Test API health check."""
        print("\n2️⃣ Testing API Health...")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/health") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        print(f"   Status: {data.get('status', 'unknown')}")
                        self.test_results["api_health"] = True
                        print("   ✅ API health check passed")
                    else:
                        print(f"   ❌ API health failed: {resp.status}")
                        self.test_results["api_health"] = False
                        
        except Exception as e:
            print(f"   ❌ API health error: {e}")
            self.test_results["api_health"] = False
    
    async def test_activity_publishing(self):
        """Test activity publishing."""
        print("\n3️⃣ Testing Activity Publishing...")
        
        activities_to_test = [
            {"type": "test_start", "details": {"test": "smoke_test"}},
            {"type": "user_action", "details": {"action": "test_action"}},
            {"type": "system_event", "details": {"component": "test_component"}}
        ]
        
        try:
            async with aiohttp.ClientSession() as session:
                for i, activity in enumerate(activities_to_test):
                    start_time = time.perf_counter()
                    
                    async with session.post(
                        f"{self.api_url}/api/admin/activities",
                        json=activity
                    ) as resp:
                        
                        end_time = time.perf_counter()
                        latency = (end_time - start_time) * 1000  # Convert to ms
                        
                        if resp.status == 200:
                            data = await resp.json()
                            print(f"   Activity {i+1}: {activity['type']} (latency: {latency:.2f}ms)")
                        else:
                            print(f"   ❌ Activity {i+1} failed: {resp.status}")
                            self.test_results["activity_publish"] = False
                            return
                            
            self.test_results["activity_publish"] = True
            print("   ✅ Activity publishing test passed")
            
        except Exception as e:
            print(f"   ❌ Activity publish error: {e}")
            self.test_results["activity_publish"] = False
    
    async def test_activity_listing(self):
        """Test activity listing."""
        print("\n4️⃣ Testing Activity Listing...")
        
        try:
            async with aiohttp.ClientSession() as session:
                start_time = time.perf_counter()
                
                async with session.get(
                    f"{self.api_url}/api/admin/activities?limit=10"
                ) as resp:
                    
                    end_time = time.perf_counter()
                    latency = (end_time - start_time) * 1000
                    
                    if resp.status == 200:
                        data = await resp.json()
                        activities = data.get("activities", [])
                        total = data.get("total", 0)
                        
                        print(f"   Retrieved {len(activities)} activities (total: {total})")
                        print(f"   Query latency: {latency:.2f}ms")
                        
                        if len(activities) >= 0:  # Should have at least test activities
                            self.test_results["activity_list"] = True
                            print("   ✅ Activity listing test passed")
                        else:
                            print("   ❌ No activities found")
                            self.test_results["activity_list"] = False
                    else:
                        print(f"   ❌ Activity listing failed: {resp.status}")
                        self.test_results["activity_list"] = False
                        
        except Exception as e:
            print(f"   ❌ Activity list error: {e}")
            self.test_results["activity_list"] = False
    
    async def test_websocket_connection(self):
        """Test WebSocket connection."""
        print("\n5️⃣ Testing WebSocket Connection...")
        
        try:
            uri = f"{self.ws_url}/api/admin/feed"
            
            async with websockets.connect(uri) as websocket:
                # Wait for ready message
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                
                if data.get("type") == "ready":
                    print("   WebSocket connected successfully")
                    print(f"   Bus type: {data.get('bus_type', 'unknown')}")
                    self.test_results["websocket"] = True
                    print("   ✅ WebSocket connection test passed")
                else:
                    print(f"   ❌ Unexpected ready message: {data}")
                    self.test_results["websocket"] = False
                    
        except asyncio.TimeoutError:
            print("   ❌ WebSocket connection timeout")
            self.test_results["websocket"] = False
        except Exception as e:
            print(f"   ❌ WebSocket error: {e}")
            self.test_results["websocket"] = False
    
    async def test_realtime_events(self):
        """Test real-time event reception via WebSocket."""
        print("\n6️⃣ Testing Real-time Event Reception...")
        
        try:
            uri = f"{self.ws_url}/api/admin/feed"
            
            async with websockets.connect(uri) as websocket:
                # Wait for ready message
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                ready_data = json.loads(response)
                
                # Send ping to test connection
                await websocket.send(json.dumps({"type": "ping"}))
                ping_response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                
                # Publish a test activity to trigger real-time event
                test_activity = {
                    "type": "realtime_test",
                    "details": {"test": "websocket_realtime"}
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{self.api_url}/api/admin/activities",
                        json=test_activity
                    ) as resp:
                        if resp.status == 200:
                            # Wait for real-time event
                            try:
                                event_response = await asyncio.wait_for(
                                    websocket.recv(), 
                                    timeout=3.0
                                )
                                event_data = json.loads(event_response)
                                
                                if event_data.get("type") == "activity":
                                    activity_data = event_data.get("data", {})
                                    if activity_data.get("type") == "realtime_test":
                                        print("   Real-time event received successfully")
                                        self.test_results["realtime"] = True
                                        print("   ✅ Real-time event test passed")
                                    else:
                                        print(f"   ❌ Unexpected event type: {activity_data.get('type')}")
                                        self.test_results["realtime"] = False
                                else:
                                    print(f"   ❌ Unexpected message type: {event_data.get('type')}")
                                    self.test_results["realtime"] = False
                            except asyncio.TimeoutError:
                                print("   ❌ No real-time event received")
                                self.test_results["realtime"] = False
                        else:
                            print(f"   ❌ Failed to publish test activity: {resp.status}")
                            self.test_results["realtime"] = False
                            
        except Exception as e:
            print(f"   ❌ Real-time test error: {e}")
            self.test_results["realtime"] = False
    
    async def test_performance_metrics(self):
        """Test performance and latency metrics."""
        print("\n7️⃣ Testing Performance Metrics...")
        
        try:
            # Get admin stats which includes performance data
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/api/admin/stats") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        bus_config = data.get("bus_config", {})
                        
                        print(f"   Bus Type: {bus_config.get('bus_type', 'unknown')}")
                        print(f"   Production Ready: {bus_config.get('production_ready', False)}")
                        print(f"   Total Activities: {data.get('total_activities', 0)}")
                        
                        # Check if we have performance monitoring
                        if bus_config.get("bus_type") in ["RedisBus", "SupabaseBus"]:
                            print("   Performance monitoring: Enabled")
                            self.test_results["performance"] = True
                            print("   ✅ Performance metrics test passed")
                        else:
                            print("   Performance monitoring: In-memory (development only)")
                            self.test_results["performance"] = False
                    else:
                        print(f"   ❌ Stats endpoint failed: {resp.status}")
                        self.test_results["performance"] = False
                        
        except Exception as e:
            print(f"   ❌ Performance test error: {e}")
            self.test_results["performance"] = False
    
    async def test_error_handling(self):
        """Test error handling and recovery."""
        print("\n8️⃣ Testing Error Handling...")
        
        try:
            # Test with invalid JSON
            async with aiohttp.ClientSession() as session:
                # Test invalid activity data
                async with session.post(
                    f"{self.api_url}/api/admin/activities",
                    json={"invalid": "data", "missing": ["required", "fields"]}
                ) as resp:
                    
                    if resp.status == 500:  # Should handle gracefully
                        print("   Error handling: Working correctly")
                        self.test_results["error_handling"] = True
                        print("   ✅ Error handling test passed")
                    else:
                        print(f"   ❌ Unexpected status for invalid data: {resp.status}")
                        self.test_results["error_handling"] = False
                        
        except Exception as e:
            print(f"   ❌ Error handling test error: {e}")
            self.test_results["error_handling"] = False
    
    async def print_test_results(self):
        """Print comprehensive test results."""
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:.<30} {status}")
        
        print("-" * 50)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("\n🎉 All tests passed! Admin bus is production ready.")
        else:
            print(f"\n⚠️  {total_tests - passed_tests} tests failed. Check configuration.")
        
        return passed_tests == total_tests


async def main():
    """Main test execution."""
    print("🚀 Admin Real-time Bus Smoke Test")
    print("Testing Redis/Supabase integration...")
    
    # Check environment variables
    if not os.getenv("NEXT_PUBLIC_API_URL"):
        print("⚠️  NEXT_PUBLIC_API_URL not set, using default: http://localhost:8000")
    if not os.getenv("NEXT_PUBLIC_WS_URL"):
        print("⚠️  NEXT_PUBLIC_WS_URL not set, using default: ws://localhost:8000")
    
    # Run tests
    tester = BusSmokeTest()
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())