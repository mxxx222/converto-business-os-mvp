import { HTTP_REQUESTS } from '@/lib/obs/metrics';

export async function timed<T>(
  req: Request,
  route: string,
  handler: () => Promise<T>,
  method = req.method ?? 'GET'
) {
  const started = process.hrtime.bigint();

  try {
    const result = await handler();
    const duration = Number(process.hrtime.bigint() - started) / 1e9;
    const status =
      result instanceof Response ? String(result.status) : '200';
    HTTP_REQUESTS.labels(method, route, status).observe(duration);
    return result;
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - started) / 1e9;
    HTTP_REQUESTS.labels(method, route, '500').observe(duration);
    throw error;
  }
}
