#!/usr/bin/env node

/**
 * Render MCP Server for Cursor
 * Provides tools for monitoring and managing Render deployments
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_API_BASE = 'https://api.render.com/v1';

if (!RENDER_API_KEY) {
  console.error('Error: RENDER_API_KEY environment variable is required');
  process.exit(1);
}

const server = new Server(
  {
    name: 'render-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'render_deployment_status',
        description: 'Check deployment status for a Render service',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: {
              type: 'string',
              description: 'Render service ID (e.g., srv-d3r10pjipnbc73asaod0)',
            },
          },
          required: ['service_id'],
        },
      },
      {
        name: 'render_get_logs',
        description: 'Fetch live logs from a Render service',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: {
              type: 'string',
              description: 'Render service ID',
            },
            limit: {
              type: 'number',
              description: 'Number of log lines to fetch (default: 100)',
              default: 100,
            },
          },
          required: ['service_id'],
        },
      },
      {
        name: 'render_get_env_vars',
        description: 'List environment variables for a service',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: {
              type: 'string',
              description: 'Render service ID',
            },
          },
          required: ['service_id'],
        },
      },
      {
        name: 'render_ssl_status',
        description: 'Check SSL certificate status for custom domains',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: {
              type: 'string',
              description: 'Render service ID',
            },
          },
          required: ['service_id'],
        },
      },
      {
        name: 'render_trigger_deploy',
        description: 'Trigger a manual deployment',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: {
              type: 'string',
              description: 'Render service ID',
            },
          },
          required: ['service_id'],
        },
      },
      {
        name: 'render_list_services',
        description: 'List all services in workspace',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'render_deployment_status':
        return await getDeploymentStatus(args.service_id);

      case 'render_get_logs':
        return await getLogs(args.service_id, args.limit || 100);

      case 'render_get_env_vars':
        return await getEnvVars(args.service_id);

      case 'render_ssl_status':
        return await getSSLStatus(args.service_id);

      case 'render_trigger_deploy':
        return await triggerDeploy(args.service_id);

      case 'render_list_services':
        return await listServices();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Helper functions
async function makeRenderRequest(endpoint, init = {}) {
  const response = await fetch(`${RENDER_API_BASE}${endpoint}`, {
    method: init.method || 'GET',
    headers: {
      'Authorization': `Bearer ${RENDER_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    body: init.body,
  });

  if (!response.ok) {
    throw new Error(`Render API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getDeploymentStatus(serviceId) {
  const data = await makeRenderRequest(`/services/${serviceId}/deploys`);
  const latestDeploy = data[0]?.deploy;

  if (!latestDeploy) {
    return {
      content: [
        {
          type: 'text',
          text: 'No deployments found',
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: `Deployment Status: ${latestDeploy.status}\n` +
              `Trigger: ${latestDeploy.trigger}\n` +
              `Created: ${latestDeploy.createdAt}\n` +
              `Updated: ${latestDeploy.updatedAt}\n` +
              `Commit: ${latestDeploy.commit?.message || 'N/A'}`,
      },
    ],
  };
}

async function getLogs(serviceId, limit) {
  const data = await makeRenderRequest(`/services/${serviceId}/logs?limit=${limit}`);

  return {
    content: [
      {
        type: 'text',
        text: data.length > 0
          ? data.map(log => log.message).join('\n')
          : 'No logs available',
      },
    ],
  };
}

async function getEnvVars(serviceId) {
  const data = await makeRenderRequest(`/services/${serviceId}/env-vars`);

  const envVars = data
    .filter(env => !env.name.includes('SECRET') && !env.name.includes('KEY'))
    .map(env => `${env.name}=${env.value}`)
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: envVars || 'No environment variables found',
      },
    ],
  };
}

async function getSSLStatus(serviceId) {
  const data = await makeRenderRequest(`/services/${serviceId}/custom-domains`);

  const domains = data.map(domain =>
    `${domain.customDomain.name}: ${domain.customDomain.verificationStatus}`
  ).join('\n');

  return {
    content: [
      {
        type: 'text',
        text: domains || 'No custom domains found',
      },
    ],
  };
}

async function triggerDeploy(serviceId) {
  const data = await makeRenderRequest(`/services/${serviceId}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: false }),
  });

  return {
    content: [
      {
        type: 'text',
        text: `Deployment triggered: ${data.deploy?.id}`,
      },
    ],
  };
}

async function listServices() {
  const data = await makeRenderRequest('/services');

  const services = data
    .filter(service => service.service.name.includes('converto'))
    .map(service =>
      `${service.service.name} (${service.service.id}): ${service.service.type}`
    )
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: services || 'No Converto services found',
      },
    ],
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Render MCP Server running on stdio');
}

main().catch(console.error);
