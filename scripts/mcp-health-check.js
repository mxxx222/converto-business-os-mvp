#!/usr/bin/env node

/**
 * MCP Server Health Check
 * Monitors MCP servers and reports status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_SERVERS = [
  {
    name: 'auto-deploy-tools',
    file: 'mcp_auto_deploy_server.js',
    requiredEnv: ['RENDER_API_KEY', 'GITHUB_TOKEN'],
    description: 'Deployment automation'
  },
  {
    name: 'render-tools',
    file: 'mcp_render_server.js',
    requiredEnv: ['RENDER_API_KEY'],
    description: 'Render.com management'
  },
  {
    name: 'github-tools',
    file: 'mcp_github_server.js',
    requiredEnv: ['GITHUB_TOKEN'],
    description: 'GitHub operations'
  },
  {
    name: 'vercel-tools',
    file: 'mcp_vercel_server.js',
    requiredEnv: ['VERCEL_API_TOKEN'],
    description: 'Vercel deployment'
  },
  {
    name: 'resend-tools',
    file: 'mcp_resend_server.js',
    requiredEnv: ['RESEND_API_KEY'],
    description: 'Email automation'
  },
  {
    name: 'notion-tools',
    file: 'mcp_notion_server.js',
    requiredEnv: ['NOTION_TOKEN'],
    description: 'Notion integration'
  },
  {
    name: 'openai-tools',
    file: 'mcp_openai_server.js',
    requiredEnv: ['OPENAI_API_KEY'],
    description: 'OpenAI integration'
  }
];

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function checkFileExists(filepath) {
  return fs.existsSync(filepath);
}

function checkEnvVar(varName) {
  const value = process.env[varName];
  return value && value.length > 0;
}

function checkServerHealth(server) {
  const projectRoot = path.join(__dirname, '..');
  const serverPath = path.join(projectRoot, server.file);
  
  const health = {
    name: server.name,
    description: server.description,
    fileExists: false,
    envVarsSet: [],
    envVarsMissing: [],
    status: 'unknown',
    issues: []
  };

  // Check file exists
  health.fileExists = checkFileExists(serverPath);
  if (!health.fileExists) {
    health.status = 'error';
    health.issues.push(`Server file not found: ${server.file}`);
    return health;
  }

  // Check environment variables
  for (const envVar of server.requiredEnv) {
    if (checkEnvVar(envVar)) {
      health.envVarsSet.push(envVar);
    } else {
      health.envVarsMissing.push(envVar);
      health.issues.push(`Missing environment variable: ${envVar}`);
    }
  }

  // Determine status
  if (health.envVarsMissing.length === 0) {
    health.status = 'healthy';
  } else if (health.envVarsMissing.length === server.requiredEnv.length) {
    health.status = 'error';
  } else {
    health.status = 'warning';
  }

  return health;
}

function printHealthReport(healthChecks) {
  console.log(colorize('\n🏥 MCP Server Health Check Report', 'blue'));
  console.log(colorize('═'.repeat(60), 'gray'));
  console.log();

  let healthyCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const health of healthChecks) {
    // Status icon
    let statusIcon, statusColor;
    if (health.status === 'healthy') {
      statusIcon = '✅';
      statusColor = 'green';
      healthyCount++;
    } else if (health.status === 'warning') {
      statusIcon = '⚠️ ';
      statusColor = 'yellow';
      warningCount++;
    } else {
      statusIcon = '❌';
      statusColor = 'red';
      errorCount++;
    }

    console.log(`${statusIcon} ${colorize(health.name, statusColor)}`);
    console.log(`   ${colorize(health.description, 'gray')}`);
    
    if (health.fileExists) {
      console.log(`   ${colorize('File:', 'cyan')} ✓ Found`);
    } else {
      console.log(`   ${colorize('File:', 'cyan')} ✗ Not found`);
    }

    if (health.envVarsSet.length > 0) {
      console.log(`   ${colorize('Env Vars:', 'cyan')} ✓ ${health.envVarsSet.join(', ')}`);
    }
    
    if (health.envVarsMissing.length > 0) {
      console.log(`   ${colorize('Missing:', 'red')} ✗ ${health.envVarsMissing.join(', ')}`);
    }

    if (health.issues.length > 0) {
      for (const issue of health.issues) {
        console.log(`   ${colorize('⚠', 'yellow')} ${issue}`);
      }
    }

    console.log();
  }

  console.log(colorize('─'.repeat(60), 'gray'));
  console.log(colorize('Summary:', 'blue'));
  console.log(`  ${colorize('●', 'green')} Healthy: ${healthyCount}`);
  console.log(`  ${colorize('●', 'yellow')} Warning: ${warningCount}`);
  console.log(`  ${colorize('●', 'red')} Error: ${errorCount}`);
  console.log();

  // Overall status
  if (errorCount === 0 && warningCount === 0) {
    console.log(colorize('✅ All MCP servers are healthy!', 'green'));
  } else if (errorCount > 0) {
    console.log(colorize('❌ Some MCP servers have errors', 'red'));
    console.log(colorize('\n💡 Tip: Set missing environment variables in ~/.zshrc or ~/.bashrc', 'yellow'));
  } else {
    console.log(colorize('⚠️  Some MCP servers have warnings', 'yellow'));
  }

  console.log();

  return {
    healthy: healthyCount,
    warning: warningCount,
    error: errorCount,
    total: healthChecks.length
  };
}

function generateCursorConfig(healthChecks) {
  const projectRoot = path.join(__dirname, '..');
  
  const config = {
    mcpServers: {}
  };

  for (const health of healthChecks) {
    if (health.fileExists) {
      const server = MCP_SERVERS.find(s => s.name === health.name);
      const serverPath = path.join(projectRoot, server.file);
      
      config.mcpServers[health.name] = {
        command: 'node',
        args: [serverPath],
        env: {}
      };

      for (const envVar of server.requiredEnv) {
        config.mcpServers[health.name].env[envVar] = `\${${envVar}}`;
      }
    }
  }

  return config;
}

function main() {
  console.log(colorize('DocFlow MCP Health Check', 'cyan'));
  console.log(colorize('Checking all MCP servers...', 'gray'));

  // Run health checks
  const healthChecks = MCP_SERVERS.map(server => checkServerHealth(server));

  // Print report
  const summary = printHealthReport(healthChecks);

  // Generate Cursor config
  if (process.argv.includes('--generate-config')) {
    const config = generateCursorConfig(healthChecks);
    console.log(colorize('📝 Cursor MCP Configuration:', 'blue'));
    console.log(colorize('─'.repeat(60), 'gray'));
    console.log(JSON.stringify(config, null, 2));
    console.log();
    console.log(colorize('💡 Copy this to Cursor Settings → MCP Servers', 'yellow'));
    console.log();
  }

  // Exit code based on errors
  if (summary.error > 0) {
    process.exit(1);
  } else if (summary.warning > 0) {
    process.exit(0); // Warnings are OK
  } else {
    process.exit(0);
  }
}

main();

