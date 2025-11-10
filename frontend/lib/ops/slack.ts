// Ops & Recovery — Slack Webhook Comms
// mkBlocks, postSlack, canary/ready FI+EN msg generators

// Use native fetch in Node.js 18+

type SlackMsgOpts = {
  version: string;
  backendMetricsUrl: string;
  rnUrl: string;
  implPackUrl: string;
};

type SlackPayload = {
  blocks: any[];
};

// Block generators
function mkBlocksCanaryStartFI(opts: SlackMsgOpts) {
  return [
    { type: 'header', text: { type: 'plain_text', text: `🟢 Canary start: v${opts.version} (FI)` } },
    { type: 'section', text: { type: 'mrkdwn', text: 'Canary deployment käynnissä. Seuraa backend-metriikoita ja RN-linkkiä.' } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Release Notes:* <${opts.rnUrl}|Katso RN>` },
        { type: 'mrkdwn', text: `*Metrics:* <${opts.backendMetricsUrl}|API metrics>` }
      ]
    },
    { type: 'context', elements: [{ type: 'plain_text', text: '30 min: API p95 <200ms, publish <20ms, 5xx <1%' }] },
    { type: 'divider' },
    { type: 'context', elements: [{ type: 'plain_text', text: `Implementation Pack: ${opts.implPackUrl}` }] },
  ];
}

function mkBlocksCanaryStartEN(opts: SlackMsgOpts) {
  return [
    { type: 'header', text: { type: 'plain_text', text: `🟢 Canary start: v${opts.version} (EN)` } },
    { type: 'section', text: { type: 'mrkdwn', text: 'Canary deployment ongoing. Track backend metrics and RN link.' } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Release Notes:* <${opts.rnUrl}|View RN>` },
        { type: 'mrkdwn', text: `*Metrics:* <${opts.backendMetricsUrl}|API metrics>` }
      ]
    },
    { type: 'context', elements: [{ type: 'plain_text', text: '30 min: API p95 <200ms, publish <20ms, 5xx <1%' }] },
    { type: 'divider' },
    { type: 'context', elements: [{ type: 'plain_text', text: `Implementation Pack: ${opts.implPackUrl}` }] },
  ];
}

function mkBlocksCanaryReadyFI(opts: SlackMsgOpts) {
  return [
    { type: 'header', text: { type: 'plain_text', text: `✅ 100% valmis: v${opts.version} (FI)` } },
    { type: 'section', text: { type: 'mrkdwn', text: 'Kaikki metriiikat vihreällä, julkaisu valmis, audit trail päivitetty.' } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Release Notes:* <${opts.rnUrl}|Katso RN>` },
        { type: 'mrkdwn', text: `*Metrics:* <${opts.backendMetricsUrl}|API metrics>` }
      ]
    },
    { type: 'divider' },
    { type: 'context', elements: [{ type: 'plain_text', text: `Implementation Pack: ${opts.implPackUrl}` }] },
  ];
}

function mkBlocksCanaryReadyEN(opts: SlackMsgOpts) {
  return [
    { type: 'header', text: { type: 'plain_text', text: `✅ 100% ready: v${opts.version} (EN)` } },
    { type: 'section', text: { type: 'mrkdwn', text: '100% rollout: all metrics green, audit event recorded.' } },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Release Notes:* <${opts.rnUrl}|View RN>` },
        { type: 'mrkdwn', text: `*Metrics:* <${opts.backendMetricsUrl}|API metrics>` }
      ]
    },
    { type: 'divider' },
    { type: 'context', elements: [{ type: 'plain_text', text: `Implementation Pack: ${opts.implPackUrl}` }] },
  ];
}

// Helper to POST to Slack webhook
export async function postSlack(payload: SlackPayload, webhookUrl?: string) {
  const url = webhookUrl || process.env.SLACK_WEBHOOK_URL;
  if (!url) throw new Error('SLACK_WEBHOOK_URL missing');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Slack webhook failed: ${err}`);
  }
  return true;
}

// Exported generators for workflow/scripts
export function slackCanaryStartFI(opts: SlackMsgOpts, webhookUrl?: string) {
  return postSlack({ blocks: mkBlocksCanaryStartFI(opts) }, webhookUrl);
}
export function slackCanaryStartEN(opts: SlackMsgOpts, webhookUrl?: string) {
  return postSlack({ blocks: mkBlocksCanaryStartEN(opts) }, webhookUrl);
}
export function slackCanaryReadyFI(opts: SlackMsgOpts, webhookUrl?: string) {
  return postSlack({ blocks: mkBlocksCanaryReadyFI(opts) }, webhookUrl);
}
export function slackCanaryReadyEN(opts: SlackMsgOpts, webhookUrl?: string) {
  return postSlack({ blocks: mkBlocksCanaryReadyEN(opts) }, webhookUrl);
}

// For future: Add rollback FI/EN generators if needed.
