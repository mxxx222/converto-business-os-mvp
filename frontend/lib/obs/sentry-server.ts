import * as Sentry from '@sentry/nextjs';

type Handler<TArgs extends any[], TResult> = (...args: TArgs) => TResult | Promise<TResult>;

export function withSentryContext<TArgs extends any[], TResult>(fn: Handler<TArgs, TResult>) {
  return async (...args: TArgs): Promise<TResult> => {
    const candidate = (args?.[0] as any) ?? {};
    const req = candidate?.req ?? candidate;
    const headers = req?.headers;
    const cookies = req?.cookies;

    const requestId =
      headers?.get?.('x-request-id') ??
      headers?.['x-request-id'] ??
      crypto.randomUUID();

    const tenantId =
      headers?.get?.('x-tenant-id') ??
      headers?.['x-tenant-id'] ??
      cookies?.get?.('tenant_id')?.value ??
      cookies?.tenant_id ??
      undefined;

    const sdk = Sentry as any;

    sdk.configureScope((scope: any) => {
      scope.setTag('request_id', String(requestId));
      if (tenantId) {
        scope.setTag('tenant_id', String(tenantId));
      }
    });

    try {
      return await fn(...args);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    } finally {
      sdk.getCurrentHub?.().getScope?.()?.clear?.();
    }
  };
}
