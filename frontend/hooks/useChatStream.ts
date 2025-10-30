import { useRef, useState } from 'react';

type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string };

type StreamMetrics = {
  startedAt: number;
  endedAt?: number;
  ms?: number;
  events: number;
  chars: number;
  requestId?: string;
  model?: string;
  org?: string;
  project?: string;
};

export function useChatStream(opts?: { onRaw?: (line: string) => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function send(messages: ChatMsg[], model?: string) {
    setLoading(true);
    setText('');
    const startedAt = performance.now();
    setMetrics({ startedAt, events: 0, chars: 0 });
    abortRef.current = new AbortController();

    const resp = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, stream: true }),
      signal: abortRef.current.signal,
    });

    const requestId = resp.headers.get('x-request-id') || undefined;
    const respModel = resp.headers.get('x-model') || undefined;
    const org = resp.headers.get('x-org') || undefined;
    const project = resp.headers.get('x-project') || undefined;
    setMetrics((m) => (m ? { ...m, requestId, model: respModel, org, project } : m));

    if (!resp.ok || !resp.body) {
      setLoading(false);
      setMetrics((m) => (m ? { ...m, endedAt: performance.now(), ms: performance.now() - startedAt } : m));
      throw new Error(`HTTP ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          opts?.onRaw?.(line);
          const l = line.trim();
          if (!l.startsWith('data:')) continue;
          const data = l.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          setMetrics((m) => (m ? { ...m, events: m.events + 1, chars: m.chars + data.length } : m));
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) setText((prev) => prev + delta);
          } catch {
            setText((prev) => prev + data);
          }
        }
      }
    } finally {
      const endedAt = performance.now();
      setMetrics((m) => (m ? { ...m, endedAt, ms: endedAt - startedAt } : m));
      setLoading(false);
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setLoading(false);
  }

  return { text, loading, send, cancel, metrics };
}
