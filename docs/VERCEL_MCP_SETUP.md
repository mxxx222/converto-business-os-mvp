# Vercel MCP Server Setup Guide

## Overview

Vercel Deployment MCP Server provides automated Vercel deployments via MCP protocol.

## Token

**Vercel Token:** Set as environment variable `VERCEL_TOKEN`

Get your token from: https://vercel.com/account/tokens

## Installation

### Option 1: MCP Server (Recommended)

Add to your Cursor MCP configuration (`~/.cursor/mcp.json` or Cursor settings):

```json
{
  "mcpServers": {
    "vercel-deploy-tools": {
      "command": "node",
      "args": [
        "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)/mcp_vercel_deploy_server.js"
      ],
      "env": {
        "VERCEL_TOKEN": "${VERCEL_TOKEN}"
      }
    }
  }
}
```

### Option 2: CLI Script

Use the CLI script directly:

```bash
# Deploy to production
./scripts/vercel-deploy.sh ./frontend --prod

# Deploy preview
./scripts/vercel-deploy.sh ./frontend --preview
```

Or set environment variable and run:

```bash
export VERCEL_TOKEN="your_vercel_token_here"
cd frontend
vercel --prod --yes
```

## Available MCP Tools

### 1. `vercel_deploy_cli`
Deploy using Vercel CLI (recommended for local deployments).

**Parameters:**
- `project_path` (string, optional): Path to project (default: `./frontend`)
- `production` (boolean, optional): Deploy to production (default: `true`)
- `force` (boolean, optional): Skip confirmation (default: `true`)

**Example:**
```json
{
  "name": "vercel_deploy_cli",
  "arguments": {
    "project_path": "./frontend",
    "production": true,
    "force": true
  }
}
```

### 2. `vercel_deploy_api`
Deploy using Vercel API (for CI/CD).

**Parameters:**
- `project_name` (string, required): Vercel project name
- `git_source` (string, required): GitHub repo (e.g., "username/repo")
- `branch` (string, optional): Git branch (default: `main`)
- `build_command` (string, optional): Build command (default: `npm run build`)

### 3. `vercel_check_status`
Check deployment status.

**Parameters:**
- `deployment_url` (string, required): Deployment URL or ID

### 4. `vercel_list_projects`
List all Vercel projects.

**Parameters:** None

### 5. `vercel_get_logs`
Get deployment logs.

**Parameters:**
- `deployment_id` (string, required): Deployment ID

## Usage Examples

### Deploy Frontend to Production

```javascript
// Via MCP
{
  "name": "vercel_deploy_cli",
  "arguments": {
    "project_path": "./frontend",
    "production": true
  }
}
```

### Check Deployment Status

```javascript
{
  "name": "vercel_check_status",
  "arguments": {
    "deployment_url": "https://converto-fi.vercel.app"
  }
}
```

### List All Projects

```javascript
{
  "name": "vercel_list_projects",
  "arguments": {}
}
```

## Troubleshooting

### Token Issues
- Verify token at: https://vercel.com/account/tokens
- Token format: Should be alphanumeric string
- Token permissions: Needs `deployments:read` and `deployments:write`

### Build Failures
- Check build logs: Use `vercel_get_logs` tool
- Local build test: Run `npm run build` in project directory
- Environment variables: Ensure all required env vars are set in Vercel dashboard

### CLI Not Found
- Install Vercel CLI: `npm i -g vercel`
- Or use npx: `npx vercel --prod --yes`

## Security Notes

⚠️ **Important:**
- Never commit Vercel token to git
- Use environment variables in production
- Rotate token if exposed
- Token has full access to your Vercel account

## Next Steps

1. Test deployment: Run `vercel_deploy_cli` tool
2. Verify deployment: Check status with `vercel_check_status`
3. Monitor logs: Use `vercel_get_logs` if issues occur

## Support

For issues:
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Review deployment logs
3. Verify project configuration in `vercel.json`
