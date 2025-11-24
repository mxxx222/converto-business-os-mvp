# Testing Commands for Dashboard & WebSocket

## Backend API Testing

### Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Test GET Activities Endpoint

```bash
# Basic request
curl http://localhost:8000/api/admin/activities

# With pagination
curl "http://localhost:8000/api/admin/activities?limit=10&offset=0"

# With tenant filter
curl "http://localhost:8000/api/admin/activities?limit=10&tenant_id=default"
```

### Test POST Activity Endpoint

```bash
# Create a test activity
curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "upload",
    "status": "success",
    "title": "Test Document Uploaded",
    "details": "Document test.pdf was successfully uploaded",
    "metadata": {
      "filename": "test.pdf",
      "fileSize": "12345"
    },
    "tenantId": "default"
  }'

# Create different activity types
curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{"type":"processing","status":"pending","title":"Processing Document"}'

curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{"type":"completed","status":"success","title":"Document Processed"}'

curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{"type":"failed","status":"failed","title":"Processing Failed","details":"Error occurred"}'
```

### Test Rate Limiting (if implemented in backend)

```bash
# Make multiple rapid requests to test rate limiting
for i in {1..65}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/admin/activities
done

# Check for 429 responses and Retry-After headers
curl -v http://localhost:8000/api/admin/activities 2>&1 | grep -E "(HTTP|Retry-After|X-RateLimit)"
```

## WebSocket Testing

### Install wscat

```bash
npm install -g wscat
```

### Connect to WebSocket

```bash
# Basic connection
wscat -c "ws://localhost:8000/api/admin/feed?token=admin_test"

# With proper token (if ADMIN_JWT_SECRET is set)
wscat -c "ws://localhost:8000/api/admin/feed?token=$ADMIN_JWT_SECRET"
```

### WebSocket Commands

Once connected, send these messages:

```json
// Ping/Pong test
{"type":"ping"}

// Auth message
{"type":"auth","token":"admin_test","tenant_id":"default"}

// Should receive ready message
// {"type":"ready","bus_type":"in-memory","production_ready":false,"tenant_id":"default"}
```

### Test Real-time Updates

1. **Terminal 1**: Connect WebSocket
```bash
wscat -c "ws://localhost:8000/api/admin/feed?token=admin_test"
```

2. **Terminal 2**: Create activity (should appear in Terminal 1)
```bash
curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{"type":"test","status":"success","title":"Real-time Test"}'
```

3. **Terminal 1**: Should receive WebSocket message:
```json
{
  "type": "activity",
  "data": {
    "id": "...",
    "type": "test",
    "status": "success",
    "timestamp": "...",
    "title": "Real-time Test"
  }
}
```

## Frontend Testing

### Start Frontend Dev Server

```bash
cd frontend
npm install
npm run dev
```

### Test Dashboard

1. Visit: `http://localhost:3000/admin/dashboard`
2. Open browser console (F12)
3. Check for:
   - WebSocket connection status
   - Activity feed loading
   - Real-time updates

### Test WebSocket Connection in Browser Console

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/api/admin/feed?token=admin_test');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
ws.onerror = (error) => console.error('Error:', error);
ws.onclose = (event) => console.log('Closed:', event.code, event.reason);

// Send ping
ws.send(JSON.stringify({type: 'ping'}));
```

### Test Activity Feed Component

```javascript
// In browser console on dashboard page
// Check if activities are loaded
console.log('Activities:', document.querySelectorAll('[class*="activityItem"]').length);

// Check connection status
console.log('Connection status:', document.querySelector('[class*="statusConnected"]') || 
  document.querySelector('[class*="statusDisconnected"]'));
```

## Integration Testing

### Full Flow Test

1. **Start Backend**
```bash
cd backend
uvicorn main:app --reload
```

2. **Start Frontend**
```bash
cd frontend
npm run dev
```

3. **Create Activity via API**
```bash
curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{"type":"upload","status":"success","title":"Integration Test"}'
```

4. **Verify in Frontend**
   - Open `http://localhost:3000/admin/dashboard`
   - Activity should appear in feed
   - Check WebSocket connection is live (green indicator)

5. **Test Real-time Update**
   - Keep dashboard open
   - Create another activity via curl
   - Should appear immediately without page refresh

## RBAC Testing

### Test Unauthorized Access

```bash
# Request without token
curl -v http://localhost:8000/api/admin/activities

# Should return 401 or 403
```

### Test Token Validation

```bash
# With invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8000/api/admin/activities

# With valid token format
curl -H "Authorization: Bearer admin_test" \
  http://localhost:8000/api/admin/activities
```

## Export Testing

### Test CSV Export

1. Open dashboard in browser
2. Open browser console
3. Run:
```javascript
import('/lib/export').then(({exportToCSV}) => {
  exportToCSV([
    {name: 'Test', value: 123, date: new Date()},
    {name: 'Test 2', value: 456, date: new Date()}
  ], 'test.csv');
});
```

### Test PDF Export

```javascript
import('/lib/export').then(({exportToPDF}) => {
  exportToPDF([
    {name: 'Test', value: 123, date: new Date()},
    {name: 'Test 2', value: 456, date: new Date()}
  ], 'test.pdf', 'Test Report');
});
```

## Performance Testing

### Load Test Activities Endpoint

```bash
# Install Apache Bench
# macOS: brew install httpd
# Linux: apt-get install apache2-utils

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8000/api/admin/activities
```

### WebSocket Stress Test

```bash
# Connect multiple WebSocket clients
for i in {1..10}; do
  wscat -c "ws://localhost:8000/api/admin/feed?token=admin_test" &
done

# Create activities and watch all clients receive updates
```

## Debugging

### Backend Logs

```bash
# Run with debug logging
cd backend
LOG_LEVEL=DEBUG uvicorn main:app --reload
```

### Frontend Debugging

```javascript
// Enable WebSocket debug logging
localStorage.setItem('debug', 'websocket');

// Check activity state
console.log('Activities:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
```

### Check WebSocket Backpressure

```javascript
const ws = new WebSocket('ws://localhost:8000/api/admin/feed?token=admin_test');
ws.onopen = () => {
  console.log('Buffered amount:', ws.bufferedAmount);
  // Should be < 1MB (1048576 bytes)
};
```

## Verification Checklist

- [ ] Backend starts without errors
- [ ] GET /api/admin/activities returns data
- [ ] POST /api/admin/activities creates activity
- [ ] WebSocket connects successfully
- [ ] WebSocket receives ready message
- [ ] Activities appear in frontend feed
- [ ] Real-time updates work (no page refresh)
- [ ] Rate limiting headers present (if implemented)
- [ ] RBAC returns 401/403 appropriately
- [ ] CSV export works
- [ ] PDF export works
- [ ] Finnish locale formatting correct

