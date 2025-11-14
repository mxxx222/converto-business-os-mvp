import { performance } from 'perf_hooks';
import { WS_BACKPRESSURE_GAUGE, WS_PUBLISH_LATENCY } from '@/lib/obs/metrics';

export async function wsPublish(io: any, channel: string, payload: any, queue: { length: number } | any[]) {
  const started = performance.now();
  WS_BACKPRESSURE_GAUGE.set(queue.length);

  await io.to(channel).emit('event', payload);

  const elapsedMs = performance.now() - started;
  WS_PUBLISH_LATENCY.observe(elapsedMs);
}
