declare global {
  interface Window {
    posthog?: { capture: (name: string, payload?: Record<string, unknown>) => void };
  }
}

export function track(name: string, detail?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (window.posthog?.capture) {
      window.posthog.capture(name, detail);
    } else {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  } catch {
    // ignore
  }
}



