#!/usr/bin/env node

/**
 * Vercel Deployment MCP Server
 * Provides Vercel deployment automation via MCP protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get Vercel token from environment
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
  console.error('WARNING: VERCEL_TOKEN environment variable not set');
}

class VercelDeployMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vercel-deploy-tools',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'vercel_deploy_cli',
            description: 'Deploy to Vercel using Vercel CLI (recommended)',
            inputSchema: {
              type: 'object',
              properties: {
                project_path: {
                  type: 'string',
                  description: 'Path to project directory (default: ./frontend)',
                  default: './frontend',
                },
                production: {
                  type: 'boolean',
                  description: 'Deploy to production (default: true)',
                  default: true,
                },
                force: {
                  type: 'boolean',
                  description: 'Skip confirmation prompts (default: true)',
                  default: true,
                },
              },
              required: [],
            },
          },
          {
            name: 'vercel_deploy_api',
            description: 'Deploy to Vercel using Vercel API',
            inputSchema: {
              type: 'object',
              properties: {
                project_name: {
                  type: 'string',
                  description: 'Vercel project name',
                },
                git_source: {
                  type: 'string',
                  description: 'Git source (github repo name, e.g., "username/repo")',
                },
                branch: {
                  type: 'string',
                  description: 'Git branch to deploy (default: main)',
                  default: 'main',
                },
                build_command: {
                  type: 'string',
                  description: 'Build command (default: npm run build)',
                  default: 'npm run build',
                },
              },
              required: ['project_name'],
            },
          },
          {
            name: 'vercel_check_status',
            description: 'Check Vercel deployment status',
            inputSchema: {
              type: 'object',
              properties: {
                deployment_url: {
                  type: 'string',
                  description: 'Vercel deployment URL or ID',
                },
              },
              required: ['deployment_url'],
            },
          },
          {
            name: 'vercel_list_projects',
            description: 'List all Vercel projects',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'vercel_get_logs',
            description: 'Get Vercel deployment logs',
            inputSchema: {
              type: 'object',
              properties: {
                deployment_id: {
                  type: 'string',
                  description: 'Vercel deployment ID',
                },
              },
              required: ['deployment_id'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'vercel_deploy_cli':
            return await this.deployViaCLI(args);
          case 'vercel_deploy_api':
            return await this.deployViaAPI(args);
          case 'vercel_check_status':
            return await this.checkStatus(args);
          case 'vercel_list_projects':
            return await this.listProjects();
          case 'vercel_get_logs':
            return await this.getLogs(args);
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
          isError: true,
        };
      }
    });
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async deployViaCLI(args) {
    const { project_path = './frontend', production = true, force = true } = args;

    const projectDir = path.resolve(project_path);
    if (!fs.existsSync(projectDir)) {
      throw new Error(`Project path does not exist: ${projectDir}`);
    }

    try {
      // Set Vercel token
      process.env.VERCEL_TOKEN = VERCEL_TOKEN;

      // Build command
      const deployFlags = production ? '--prod' : '';
      const forceFlag = force ? '--yes' : '';
      const command = `npx vercel ${deployFlags} ${forceFlag}`;

      console.log(`Deploying from ${projectDir}...`);
      console.log(`Command: ${command}`);

      const output = execSync(command, {
        cwd: projectDir,
        env: { ...process.env, VERCEL_TOKEN },
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Parse output for URLs
      const urlMatch = output.match(/Production:\s+(https?:\/\/[^\s]+)/);
      const inspectMatch = output.match(/Inspect:\s+(https?:\/\/[^\s]+)/);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Vercel deployment successful!\n\n${output}\n\n${
              urlMatch ? `🌐 Production URL: ${urlMatch[1]}\n` : ''
            }${inspectMatch ? `📊 Inspect URL: ${inspectMatch[1]}\n` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Vercel CLI deployment failed: ${error.message}\n${error.stderr || ''}`);
    }
  }

  async deployViaAPI(args) {
    const {
      project_name,
      git_source,
      branch = 'main',
      build_command = 'npm run build',
    } = args;

    if (!git_source) {
      throw new Error('git_source is required for API deployment');
    }

    try {
      // Get project ID first
      const projectsResponse = await fetch('https://api.vercel.com/v9/projects', {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      });

      if (!projectsResponse.ok) {
        throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
      }

      const projects = await projectsResponse.json();
      const project = projects.projects?.find((p) => p.name === project_name);

      if (!project) {
        throw new Error(`Project "${project_name}" not found`);
      }

      // Create deployment
      const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: project_name,
          project: project.id,
          gitSource: {
            type: 'github',
            repo: git_source,
            ref: branch,
          },
          target: 'production',
          projectSettings: {
            framework: 'nextjs',
            buildCommand: build_command,
            installCommand: 'npm install',
            outputDirectory: '.next',
          },
        }),
      });

      const deployment = await deploymentResponse.json();

      if (!deploymentResponse.ok) {
        throw new Error(`Deployment failed: ${deployment.error?.message || 'Unknown error'}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Deployment created successfully!\n\n` +
              `Deployment ID: ${deployment.id}\n` +
              `URL: ${deployment.url || 'Pending...'}\n` +
              `Status: ${deployment.state || 'Building'}\n` +
              `Inspect: https://vercel.com/${deployment.creator?.username || 'dashboard'}/${project_name}/${deployment.id}\n`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Vercel API deployment failed: ${error.message}`);
    }
  }

  async checkStatus(args) {
    const { deployment_url } = args;

    try {
      // Extract deployment ID from URL if needed
      const deploymentId = deployment_url.includes('vercel.app')
        ? deployment_url.split('/').pop()
        : deployment_url;

      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch deployment: ${response.statusText}`);
      }

      const deployment = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Deployment Status:\n\n` +
              `ID: ${deployment.id}\n` +
              `URL: ${deployment.url || 'N/A'}\n` +
              `State: ${deployment.state || 'Unknown'}\n` +
              `Created: ${new Date(deployment.createdAt).toLocaleString()}\n` +
              `Ready: ${deployment.readyAt ? new Date(deployment.readyAt).toLocaleString() : 'Not ready'}\n`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check deployment status: ${error.message}`);
    }
  }

  async listProjects() {
    try {
      const response = await fetch('https://api.vercel.com/v9/projects', {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      const projects = data.projects || [];

      if (projects.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No projects found.',
            },
          ],
        };
      }

      const projectList = projects
        .map(
          (p) =>
            `- ${p.name} (${p.id})\n  URL: ${p.alias?.[0] || 'N/A'}\n  Framework: ${p.framework || 'N/A'}`
        )
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${projects.length} project(s):\n\n${projectList}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list projects: ${error.message}`);
    }
  }

  async getLogs(args) {
    const { deployment_id } = args;

    try {
      const response = await fetch(
        `https://api.vercel.com/v2/deployments/${deployment_id}/events`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const logs = await response.json();

      const logText = logs
        .map((log) => `[${log.type}] ${log.payload?.text || JSON.stringify(log.payload)}`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Deployment Logs (${logs.length} events):\n\n${logText}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get logs: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vercel Deploy MCP server running on stdio');
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new VercelDeployMCPServer();
  server.run().catch(console.error);
}

module.exports = { VercelDeployMCPServer };
