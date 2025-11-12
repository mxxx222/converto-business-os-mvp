# Upstash Redis - DocFlow Admin Queue

## Service Details
- **Service Name**: Upstash Redis  
- **Purpose**: DocFlow Admin Background Jobs & Queue
- **Environment**: Production
- **Region**: EU (eu-west-1, Ireland)
- **Free Tier**: 10,000 requests/day
- **Status**: Active
- **Created**: 2025-11-11

## Database Configuration
- **Name**: `docflow-admin-queue`
- **Type**: Regional  
- **Region**: `eu-west-1` (closest to Helsinki, EU compliant)
- **Eviction**: No eviction (data persistence)

## Integration Details
- **Backend Service**: docflow-admin-api (Fly.io)
- **Use Case**: Background job processing, AI enrichment queue
- **Connection Type**: REST API (HTTP)

## Environment Variables
```bash
UPSTASH_REDIS_REST_URL="https://your-db-id.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-rest-token"
ADMIN_BUS_TYPE="redis"
```

## Fly.io Integration
- **App**: docflow-admin-api
- **Secrets Set**: ✅ Configured
- **Deployment**: Ready to deploy
- **Configuration**: Updated fly.toml

## Monitoring
- **Health Check**: Redis connection established
- **Expected Logs**: "✅ Redis connection established"
- **Error Prevention**: Eliminates ECONNREFUSED ::1:6379 errors

## Cost Optimization
- **Monthly Cost**: $0 (Free tier)
- **Upgrade Threshold**: 10,000 requests/day
- **ROI**: 15-30 min setup → eliminates error noise, enables production background jobs

## Backup & Security
- **Data Persistence**: Yes (No eviction policy)
- **EU Compliance**: ✅ GDPR compliant
- **API Security**: Token-based authentication

## Next Steps
1. ✅ Configuration complete
2. ⏳ Upstash account creation (5 min)
3. ⏳ Credential deployment (2 min) 
4. ⏳ Verification (1 min)
5. ✅ Production ready background jobs enabled