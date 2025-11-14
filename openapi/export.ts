import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';

const serverUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'DocFlow API',
    version: '1.0.0',
    description: 'Operational endpoints that back DocFlow observability.',
    contact: {
      name: 'DocFlow SRE',
      email: 'hello@converto.fi'
    }
  },
  servers: [{ url: serverUrl }],
  tags: [
    {
      name: 'Observability',
      description: 'Metrics, smoke checks, and internal health endpoints'
    }
  ],
  paths: {
    '/api/metrics': {
      get: {
        summary: 'Prometheus metrics',
        description: 'Exports Prometheus text format covering HTTP/OCR/WS metrics.',
        operationId: 'getPrometheusMetrics',
        tags: ['Observability'],
        responses: {
          '200': {
            description: 'Metrics payload',
            content: {
              'text/plain': {
                schema: { type: 'string', example: '# HELP docflow_' }
              }
            }
          }
        }
      }
    },
    '/api/observability': {
      get: {
        summary: 'Observability smoke test',
        description: 'Triggers Sentry + metrics instrumentation to validate the observability pipeline.',
        operationId: 'getObservabilitySmoke',
        tags: ['Observability'],
        responses: {
          '200': {
            description: 'Smoke check completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ObservabilitySmokeResponse' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      ObservabilitySmokeResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Observability pipeline healthy' }
        },
        required: ['ok', 'message']
      }
    }
  }
};

const outputPath = path.join(process.cwd(), 'openapi.yaml');
fs.writeFileSync(outputPath, stringify(spec));
console.info(`OpenAPI spec exported to ${outputPath}`);
