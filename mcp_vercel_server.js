#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

class VercelMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vercel-tools',
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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'vercel_deploy',
            description: 'Deploy to Vercel using API',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'Vercel project name',
                },
                repoId: {
                  type: 'string',
                  description: 'GitHub repository ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
                buildCommand: {
                  type: 'string',
                  description: 'Build command (default: npm run build)',
                  default: 'npm run build',
                },
                installCommand: {
                  type: 'string',
                  description: 'Install command (default: npm install)',
                  default: 'npm install',
                },
              },
              required: ['projectName', 'repoId', 'token'],
            },
          },
          {
            name: 'vercel_check_deployment',
            description: 'Check Vercel deployment status',
            inputSchema: {
              type: 'object',
              properties: {
                deploymentId: {
                  type: 'string',
                  description: 'Vercel deployment ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
              },
              required: ['deploymentId', 'token'],
            },
          },
          {
            name: 'vercel_update_project_settings',
            description: 'Update Vercel project settings',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'Vercel project ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
                rootDirectory: {
                  type: 'string',
                  description: 'Root directory (null for repo root)',
                },
                buildCommand: {
                  type: 'string',
                  description: 'Build command',
                },
                installCommand: {
                  type: 'string',
                  description: 'Install command',
                },
                framework: {
                  type: 'string',
                  description: 'Framework (e.g., nextjs)',
                },
              },
              required: ['projectId', 'token'],
            },
          },
          {
            name: 'vercel_get_project',
            description: 'Get Vercel project information',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'Vercel project ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
              },
              required: ['projectId', 'token'],
            },
          },
          {
            name: 'vercel_list_deployments',
            description: 'List Vercel deployments for a project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'Vercel project ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
                limit: {
                  type: 'number',
                  description: 'Number of deployments to fetch',
                  default: 10,
                },
              },
              required: ['projectId', 'token'],
            },
          },
          {
            name: 'vercel_deploy_production',
            description: 'Deploy to Vercel Pro production with full pipeline',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'Vercel project ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
                frontendPath: {
                  type: 'string',
                  description: 'Frontend directory path',
                  default: './frontend',
                },
              },
              required: ['projectId', 'token'],
            },
          },
          {
            name: 'vercel_get_logs',
            description: 'Fetch Vercel logs with filtering options',
            inputSchema: {
              type: 'object',
              properties: {
                deploymentUrl: {
                  type: 'string',
                  description: 'Deployment URL or deployment ID',
                },
                filter: {
                  type: 'string',
                  description: 'Log filter: all, error, warning, info, api, function',
                  enum: ['all', 'error', 'warning', 'info', 'api', 'function'],
                  default: 'all',
                },
                limit: {
                  type: 'number',
                  description: 'Number of log lines to fetch',
                  default: 100,
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token (optional if using CLI)',
                },
              },
              required: ['deploymentUrl'],
            },
          },
          {
            name: 'vercel_stream_logs',
            description: 'Real-time log streaming for Vercel deployment',
            inputSchema: {
              type: 'object',
              properties: {
                deploymentUrl: {
                  type: 'string',
                  description: 'Deployment URL or deployment ID',
                },
                filter: {
                  type: 'string',
                  description: 'Log filter: all, error, warning, info, api, function',
                  enum: ['all', 'error', 'warning', 'info', 'api', 'function'],
                  default: 'all',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token (optional if using CLI)',
                },
              },
              required: ['deploymentUrl'],
            },
          },
          {
            name: 'vercel_check_health',
            description: 'Check deployment health status',
            inputSchema: {
              type: 'object',
              properties: {
                deploymentUrl: {
                  type: 'string',
                  description: 'Deployment URL',
                },
                healthEndpoint: {
                  type: 'string',
                  description: 'Health check endpoint path',
                  default: '/api/health',
                },
              },
              required: ['deploymentUrl'],
            },
          },
          {
            name: 'vercel_get_deployment_status',
            description: 'Get detailed deployment status',
            inputSchema: {
              type: 'object',
              properties: {
                deploymentId: {
                  type: 'string',
                  description: 'Vercel deployment ID',
                },
                token: {
                  type: 'string',
                  description: 'Vercel API token',
                },
              },
              required: ['deploymentId', 'token'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'vercel_deploy':
            return await this.deployToVercel(args);
          case 'vercel_check_deployment':
            return await this.checkDeployment(args);
          case 'vercel_update_project_settings':
            return await this.updateProjectSettings(args);
          case 'vercel_get_project':
            return await this.getProject(args);
          case 'vercel_list_deployments':
            return await this.listDeployments(args);
          case 'vercel_deploy_production':
            return await this.deployProduction(args);
          case 'vercel_get_logs':
            return await this.getLogs(args);
          case 'vercel_stream_logs':
            return await this.streamLogs(args);
          case 'vercel_check_health':
            return await this.checkHealth(args);
          case 'vercel_get_deployment_status':
            return await this.getDeploymentStatus(args);
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
  }

  async deployToVercel(args) {
    const {
      projectName,
      repoId,
      token,
      buildCommand = 'npm run build',
      installCommand = 'npm install',
    } = args;

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: {
          type: 'github',
          ref: 'main',
          repoId: repoId,
        },
        target: 'production',
        projectSettings: {
          framework: 'nextjs',
          buildCommand,
          installCommand,
          outputDirectory: '.next',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${result.error?.message || 'Unknown error'}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Deployment started successfully!\n\nDeployment ID: ${result.id}\nURL: ${result.url}\nStatus: ${result.status}\n\nMonitor progress at: ${result.inspectorUrl}`,
        },
      ],
    };
  }

  async checkDeployment(args) {
    const { deploymentId, token } = args;

    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${result.error?.message || 'Unknown error'}`);
    }

    const status = result.status;
    const url = result.url;
    const errorCode = result.errorCode;
    const errorMessage = result.errorMessage;

    let statusText = `Status: ${status}`;
    if (status === 'ERROR') {
      statusText += `\nError Code: ${errorCode}\nError Message: ${errorMessage}`;
    } else if (status === 'READY') {
      statusText += `\n✅ Deployment successful!\nURL: ${url}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: statusText,
        },
      ],
    };
  }

  async updateProjectSettings(args) {
    const {
      projectId,
      token,
      rootDirectory,
      buildCommand,
      installCommand,
      framework,
    } = args;

    const updateData = {};
    if (rootDirectory !== undefined) updateData.rootDirectory = rootDirectory;
    if (buildCommand !== undefined) updateData.buildCommand = buildCommand;
    if (installCommand !== undefined) updateData.installCommand = installCommand;
    if (framework !== undefined) updateData.framework = framework;

    const response = await fetch(`https://api.vercel.com/v1/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${result.error?.message || 'Unknown error'}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Project settings updated successfully!\n\nUpdated settings: ${JSON.stringify(updateData, null, 2)}`,
        },
      ],
    };
  }

  async getProject(args) {
    const { projectId, token } = args;

    const response = await fetch(`https://api.vercel.com/v1/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${result.error?.message || 'Unknown error'}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Project Information:\n\nName: ${result.name}\nFramework: ${result.framework}\nRoot Directory: ${result.rootDirectory || 'Repository root'}\nBuild Command: ${result.buildCommand}\nInstall Command: ${result.installCommand}\nOutput Directory: ${result.outputDirectory}`,
        },
      ],
    };
  }

  async listDeployments(args) {
    const { projectId, token, limit = 10 } = args;

    const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${result.error?.message || 'Unknown error'}`);
    }

    const deployments = result.deployments || [];
    let deploymentList = 'Recent Deployments:\n\n';

    deployments.forEach((deployment, index) => {
      deploymentList += `${index + 1}. ID: ${deployment.uid}\n`;
      deploymentList += `   Status: ${deployment.state}\n`;
      deploymentList += `   Created: ${new Date(deployment.created).toLocaleString()}\n`;
      deploymentList += `   URL: ${deployment.url}\n`;
      if (deployment.errorMessage) {
        deploymentList += `   Error: ${deployment.errorMessage}\n`;
      }
      deploymentList += '\n';
    });

    return {
      content: [
        {
          type: 'text',
          text: deploymentList,
        },
      ],
    };
  }

  async deployProduction(args) {
    const { projectId, token, frontendPath = './frontend' } = args;
    const { execSync } = require('child_process');
    const path = require('path');

    try {
      // Build verification
      const buildResult = execSync('npm run build', {
        cwd: path.resolve(frontendPath),
        encoding: 'utf-8',
      });

      // Deploy using Vercel CLI
      const deployResult = execSync(`vercel deploy --prod --yes --token=${token}`, {
        cwd: path.resolve(frontendPath),
        encoding: 'utf-8',
      });

      // Extract deployment URL from output
      const urlMatch = deployResult.match(/https?:\/\/[^\s]+/);
      const deploymentUrl = urlMatch ? urlMatch[0] : 'Unknown';

      return {
        content: [
          {
            type: 'text',
            text: `✅ Production deployment successful!\n\nDeployment URL: ${deploymentUrl}\n\nBuild completed successfully.\n\nNext steps:\n- Health check: ${deploymentUrl}/api/health\n- View logs: vercel logs ${deploymentUrl} --follow`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  async getLogs(args) {
    const { deploymentUrl, filter = 'all', limit = 100, token } = args;
    const { execSync } = require('child_process');

    try {
      let command = `vercel logs ${deploymentUrl} --limit ${limit}`;
      if (token) {
        command += ` --token=${token}`;
      }

      const logs = execSync(command, { encoding: 'utf-8' });

      // Filter logs if needed
      let filteredLogs = logs;
      if (filter !== 'all') {
        const lines = logs.split('\n');
        const filterPatterns = {
          error: /error|failed|exception/i,
          warning: /warning|warn/i,
          info: /info/i,
          api: /api|route/i,
          function: /function|invocation|execution/i,
        };
        const pattern = filterPatterns[filter];
        if (pattern) {
          filteredLogs = lines.filter(line => pattern.test(line)).join('\n');
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Logs for ${deploymentUrl} (filter: ${filter}, limit: ${limit}):\n\n${filteredLogs}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }
  }

  async streamLogs(args) {
    const { deploymentUrl, filter = 'all', token } = args;
    // Note: Real-time streaming requires long-running process
    // This returns instructions for streaming
    return {
      content: [
        {
          type: 'text',
          text: `To stream logs in real-time, run:\n\nvercel logs ${deploymentUrl} --follow${filter !== 'all' ? ` | grep -i "${filter}"` : ''}\n\nOr use the script: ./scripts/vercel-logs-mcp.sh ${deploymentUrl} ${filter}`,
        },
      ],
    };
  }

  async checkHealth(args) {
    const { deploymentUrl, healthEndpoint = '/api/health' } = args;

    try {
      const healthUrl = `${deploymentUrl}${healthEndpoint}`;
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const status = response.status;
      const data = await response.json().catch(() => ({}));

      if (status === 200) {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Health check passed!\n\nURL: ${healthUrl}\nStatus: ${status}\nResponse: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ Health check returned status ${status}\n\nURL: ${healthUrl}\nResponse: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async getDeploymentStatus(args) {
    const { deploymentId, token } = args;

    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${result.error?.message || 'Unknown error'}`);
    }

    const status = result.status;
    const url = result.url;
    const createdAt = new Date(result.createdAt).toLocaleString();
    const readyAt = result.readyAt ? new Date(result.readyAt).toLocaleString() : 'Not ready yet';
    const errorCode = result.errorCode;
    const errorMessage = result.errorMessage;

    let statusText = `Deployment Status:\n\nID: ${deploymentId}\nStatus: ${status}\nURL: ${url}\nCreated: ${createdAt}\nReady: ${readyAt}`;

    if (status === 'ERROR') {
      statusText += `\n\n❌ Error Details:\nCode: ${errorCode}\nMessage: ${errorMessage}`;
    } else if (status === 'READY') {
      statusText += `\n\n✅ Deployment successful and ready!`;
    } else if (status === 'BUILDING' || status === 'QUEUED') {
      statusText += `\n\n⏳ Deployment in progress...`;
    }

    return {
      content: [
        {
          type: 'text',
          text: statusText,
        },
      ],
    };
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vercel MCP server running on stdio');
  }
}

const server = new VercelMCPServer();
server.run().catch(console.error);
