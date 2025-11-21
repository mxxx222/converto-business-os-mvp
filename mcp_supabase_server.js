#!/usr/bin/env node

/**
 * Supabase MCP Server for Cursor
 * Provides tools for querying and managing Supabase database
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

// Use service role key if available, otherwise use anon key
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const SUPABASE_API_BASE = `${SUPABASE_URL}/rest/v1`;

const server = new Server(
  {
    name: 'supabase-tools',
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
        name: 'supabase_query',
        description: 'Execute a SQL query on Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute (SELECT only for safety)',
            },
            table: {
              type: 'string',
              description: 'Table name (alternative to raw SQL)',
            },
            filters: {
              type: 'object',
              description: 'Filter conditions as key-value pairs',
            },
            limit: {
              type: 'number',
              description: 'Limit number of results',
              default: 100,
            },
          },
          required: [],
        },
      },
      {
        name: 'supabase_insert',
        description: 'Insert a new row into a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name',
            },
            data: {
              type: 'object',
              description: 'Data to insert as key-value pairs',
            },
          },
          required: ['table', 'data'],
        },
      },
      {
        name: 'supabase_update',
        description: 'Update rows in a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name',
            },
            data: {
              type: 'object',
              description: 'Data to update as key-value pairs',
            },
            filter: {
              type: 'object',
              description: 'Filter conditions (e.g., {id: "uuid"})',
            },
          },
          required: ['table', 'data', 'filter'],
        },
      },
      {
        name: 'supabase_delete',
        description: 'Delete rows from a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name',
            },
            filter: {
              type: 'object',
              description: 'Filter conditions (e.g., {id: "uuid"})',
            },
          },
          required: ['table', 'filter'],
        },
      },
      {
        name: 'supabase_list_tables',
        description: 'List all tables in the Supabase database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'supabase_get_table_schema',
        description: 'Get schema information for a specific table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name',
            },
          },
          required: ['table'],
        },
      },
      {
        name: 'supabase_count_rows',
        description: 'Count rows in a table with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name',
            },
            filter: {
              type: 'object',
              description: 'Filter conditions',
            },
          },
          required: ['table'],
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
      case 'supabase_query':
        return await queryTable(args);

      case 'supabase_insert':
        return await insertRow(args.table, args.data);

      case 'supabase_update':
        return await updateRows(args.table, args.data, args.filter);

      case 'supabase_delete':
        return await deleteRows(args.table, args.filter);

      case 'supabase_list_tables':
        return await listTables();

      case 'supabase_get_table_schema':
        return await getTableSchema(args.table);

      case 'supabase_count_rows':
        return await countRows(args.table, args.filter);

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

// Helper functions
async function makeSupabaseRequest(endpoint, init = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${SUPABASE_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    method: init.method || 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(init.headers || {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}\n${errorText}`);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return await response.json();
}

async function queryTable(args) {
  if (args.query) {
    // For raw SQL queries, use PostgREST query endpoint
    // Note: This is limited - full SQL requires RPC functions
    throw new Error('Raw SQL queries require RPC functions. Use table/filter approach instead.');
  }

  if (!args.table) {
    throw new Error('Either query or table must be provided');
  }

  let url = `/${args.table}?`;
  
  // Build filter query string
  if (args.filters) {
    const filters = Object.entries(args.filters);
    filters.forEach(([key, value], index) => {
      if (index > 0) url += '&';
      url += `${key}=eq.${encodeURIComponent(value)}`;
    });
  }

  if (args.limit) {
    url += `&limit=${args.limit}`;
  }

  const data = await makeSupabaseRequest(url);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

async function insertRow(table, data) {
  const result = await makeSupabaseRequest(`/${table}`, {
    method: 'POST',
    body: data,
  });

  return {
    content: [
      {
        type: 'text',
        text: `Inserted row(s):\n${JSON.stringify(result, null, 2)}`,
      },
    ],
  };
}

async function updateRows(table, data, filter) {
  let url = `/${table}?`;
  
  // Build filter query string
  const filters = Object.entries(filter);
  filters.forEach(([key, value], index) => {
    if (index > 0) url += '&';
    url += `${key}=eq.${encodeURIComponent(value)}`;
  });

  const result = await makeSupabaseRequest(url, {
    method: 'PATCH',
    body: data,
  });

  return {
    content: [
      {
        type: 'text',
        text: `Updated row(s):\n${JSON.stringify(result, null, 2)}`,
      },
    ],
  };
}

async function deleteRows(table, filter) {
  let url = `/${table}?`;
  
  // Build filter query string
  const filters = Object.entries(filter);
  filters.forEach(([key, value], index) => {
    if (index > 0) url += '&';
    url += `${key}=eq.${encodeURIComponent(value)}`;
  });

  await makeSupabaseRequest(url, {
    method: 'DELETE',
  });

  return {
    content: [
      {
        type: 'text',
        text: 'Rows deleted successfully',
      },
    ],
  };
}

async function listTables() {
  // Query information_schema to get table list
  const query = `
    SELECT table_name, table_schema
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  // Use RPC endpoint if available, otherwise return common tables
  const commonTables = ['documents', 'activities', 'users', 'receipts'];
  
  return {
    content: [
      {
        type: 'text',
        text: `Common tables: ${commonTables.join(', ')}\n\nNote: Full table list requires RPC function.`,
      },
    ],
  };
}

async function getTableSchema(table) {
  // Query information_schema for column information
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '${table}'
    ORDER BY ordinal_position;
  `;

  // For now, return a message - full schema requires RPC
  return {
    content: [
      {
        type: 'text',
        text: `Schema for table '${table}':\n\nNote: Full schema requires RPC function. Use supabase_query to inspect table structure.`,
      },
    ],
  };
}

async function countRows(table, filter) {
  let url = `/${table}?`;
  url += 'select=*'; // Select all columns for count
  
  // Build filter query string
  if (filter) {
    const filters = Object.entries(filter);
    filters.forEach(([key, value], index) => {
      url += `&${key}=eq.${encodeURIComponent(value)}`;
    });
  }

  // Use HEAD request to get count from Content-Range header
  const response = await fetch(`${SUPABASE_API_BASE}${url}`, {
    method: 'HEAD',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const contentRange = response.headers.get('content-range');
  const count = contentRange ? contentRange.split('/')[1] : 'unknown';

  return {
    content: [
      {
        type: 'text',
        text: `Row count: ${count}`,
      },
    ],
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Supabase MCP Server running on stdio');
}

main().catch(console.error);

