#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

class VercelMCPServer {
  constructor() {
    this.resolveToken = this.resolveToken.bind(this);

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
              required: ['projectName', 'repoId'],
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
              },
              required: ['deploymentId'],
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
              required: ['projectId'],
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
              },
              required: ['projectId'],
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
                limit: {
                  type: 'number',
                  description: 'Number of deployments to fetch',
                  default: 10,
                },
              },
              required: ['projectId'],
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

  resolveToken(providedToken) {
    const token =
      providedToken ||
      process.env.VERCEL_API_TOKEN ||
      process.env.VERCEL_TOKEN;

    if (!token) {
      throw new Error(
        'Vercel API token is required. Provide via arguments or set VERCEL_API_TOKEN / VERCEL_TOKEN environment variable.'
      );
    }

    return token;
  }

  async deployToVercel(args) {
    const {
      projectName,
      repoId,
      buildCommand = 'npm run build',
      installCommand = 'npm install',
    } = args;

    const token = this.resolveToken(args.token);

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
    const { deploymentId } = args;
    const token = this.resolveToken(args.token);

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
      rootDirectory,
      buildCommand,
      installCommand,
      framework,
    } = args;

    const token = this.resolveToken(args.token);

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
    const { projectId } = args;
    const token = this.resolveToken(args.token);

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
    const { projectId, limit = 10 } = args;
    const token = this.resolveToken(args.token);

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