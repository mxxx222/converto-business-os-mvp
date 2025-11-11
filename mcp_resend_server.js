#!/usr/bin/env node

/**
 * Resend MCP Server for Cursor
 * Provides tools for automated email communication and notifications
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_BASE = 'https://api.resend.com';
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@docflow.fi';

if (!RESEND_API_KEY) {
  console.error('Error: RESEND_API_KEY environment variable is required');
  console.error('Please set RESEND_API_KEY in your environment');
  process.exit(1);
}

console.log(`🚀 Resend MCP Server initializing...`);
console.log(`📧 From: ${DEFAULT_FROM_EMAIL}`);
console.log(`🌐 API Base: ${RESEND_API_BASE}`);

const server = new Server(
  {
    name: 'resend-tools',
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
        name: 'resend_send_email',
        description: 'Send email using Resend',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            html: {
              type: 'string',
              description: 'Email HTML content',
            },
            from: {
              type: 'string',
              description: 'Sender email address',
              default: 'noreply@converto.fi',
            },
          },
          required: ['to', 'subject', 'html'],
        },
      },
      {
        name: 'resend_deployment_alert',
        description: 'Send deployment notification email',
        inputSchema: {
          type: 'object',
          properties: {
            service_name: {
              type: 'string',
              description: 'Service name (e.g., converto-dashboard)',
            },
            status: {
              type: 'string',
              description: 'Deployment status (success, failed)',
            },
            deployment_url: {
              type: 'string',
              description: 'Deployment URL',
            },
            to: {
              type: 'string',
              description: 'Recipient email',
              default: 'max@herbspot.fi',
            },
          },
          required: ['service_name', 'status'],
        },
      },
      {
        name: 'resend_error_alert',
        description: 'Send error notification email',
        inputSchema: {
          type: 'object',
          properties: {
            error_message: {
              type: 'string',
              description: 'Error message',
            },
            service: {
              type: 'string',
              description: 'Service name',
            },
            severity: {
              type: 'string',
              description: 'Error severity (low, medium, high, critical)',
              default: 'high',
            },
            to: {
              type: 'string',
              description: 'Recipient email',
              default: 'max@herbspot.fi',
            },
          },
          required: ['error_message', 'service'],
        },
      },
      {
        name: 'resend_dns_alert',
        description: 'Send DNS monitoring alert',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              description: 'Domain name',
            },
            status: {
              type: 'string',
              description: 'DNS status (verified, unverified, propagating)',
            },
            message: {
              type: 'string',
              description: 'Additional message',
            },
            to: {
              type: 'string',
              description: 'Recipient email',
              default: 'max@herbspot.fi',
            },
          },
          required: ['domain', 'status'],
        },
      },
      {
        name: 'resend_daily_report',
        description: 'Send daily Converto report',
        inputSchema: {
          type: 'object',
          properties: {
            metrics: {
              type: 'object',
              description: 'Daily metrics (signups, uptime, deployments)',
            },
            to: {
              type: 'string',
              description: 'Recipient email',
              default: 'team@converto.fi',
            },
          },
          required: ['metrics'],
        },
      },
      {
        name: 'resend_pilot_signup',
        description: 'Send pilot signup confirmation',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Customer email',
            },
            name: {
              type: 'string',
              description: 'Customer name',
            },
            company: {
              type: 'string',
              description: 'Company name',
            },
          },
          required: ['to', 'name', 'company'],
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
      case 'resend_send_email':
        return await sendEmail(args.to, args.subject, args.html, args.from);

      case 'resend_deployment_alert':
        return await sendDeploymentAlert(args.service_name, args.status, args.deployment_url, args.to);

      case 'resend_error_alert':
        return await sendErrorAlert(args.error_message, args.service, args.severity, args.to);

      case 'resend_dns_alert':
        return await sendDNSAlert(args.domain, args.status, args.message, args.to);

      case 'resend_daily_report':
        return await sendDailyReport(args.metrics, args.to);

      case 'resend_pilot_signup':
        return await sendPilotSignup(args.to, args.name, args.company);

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
async function makeResendRequest(endpoint, data) {
  const response = await fetch(`${RESEND_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function sendEmail(to, subject, html, from = 'noreply@converto.fi') {
  const data = await makeResendRequest('/emails', {
    from,
    to,
    subject,
    html,
  });

  return {
    content: [
      {
        type: 'text',
        text: `Email sent successfully! ID: ${data.id}`,
      },
    ],
  };
}

async function sendDeploymentAlert(serviceName, status, deploymentUrl = '', to = 'max@herbspot.fi') {
  const emoji = status === 'success' ? '🚀' : '❌';
  const color = status === 'success' ? '#10B981' : '#EF4444';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Deployment ${status === 'success' ? 'Successful' : 'Failed'}</h1>
          </div>
          <div class="content">
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            ${deploymentUrl ? `<a href="${deploymentUrl}" class="button">View Deployment</a>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(to, `${emoji} Converto Deployment: ${serviceName}`, html);
}

async function sendErrorAlert(errorMessage, service, severity = 'high', to = 'max@herbspot.fi') {
  const emoji = severity === 'critical' ? '🚨' : '⚠️';
  const color = severity === 'critical' ? '#DC2626' : '#F59E0B';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .error { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Error Alert: ${service}</h1>
          </div>
          <div class="content">
            <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
            <div class="error">
              <strong>Error Message:</strong><br>
              ${errorMessage}
            </div>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Action Required:</strong> Please investigate and resolve immediately.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(to, `${emoji} Converto Error: ${service}`, html);
}

async function sendDNSAlert(domain, status, message = '', to = 'max@herbspot.fi') {
  const emoji = status === 'verified' ? '✅' : '🔍';
  const color = status === 'verified' ? '#10B981' : '#3B82F6';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} DNS Update: ${domain}</h1>
          </div>
          <div class="content">
            <p><strong>Domain:</strong> ${domain}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(to, `${emoji} DNS Status: ${domain}`, html);
}

async function sendDailyReport(metrics, to = 'team@converto.fi') {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .metric { background: white; padding: 16px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #10B981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Converto Report</h1>
          </div>
          <div class="content">
            ${Object.entries(metrics).map(([key, value]) => `
              <div class="metric">
                <strong>${key}:</strong> ${value}
              </div>
            `).join('')}
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(to, '📊 Daily Converto Report', html);
}

async function sendPilotSignup(to, name, company) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Converto Pilot!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for joining the Converto Business OS pilot program from ${company}!</p>
            <p>We'll be in touch soon with access details and onboarding information.</p>
            <p>Best regards,<br>Converto Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(to, '🎉 Welcome to Converto Pilot!', html);
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Resend MCP Server running on stdio');
}

main().catch(console.error);
