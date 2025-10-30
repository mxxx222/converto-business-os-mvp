# MCP OpenAI Setup

## Env
- Set `OPENAI_API_KEY` on backend (Render) – never expose to frontend
- Optional: `OPENAI_MODEL=gpt-4o-mini`

## Safe Usage
- Backend route: `POST /api/v1/ai/chat` (lazy-init OpenAI per request)
- Health: `GET /api/v1/ai/health` (checks env present)
- Models: `GET /api/v1/ai/models`

## Example Request
```bash
curl -s -X POST "$API_URL/api/v1/ai/chat" \
  -H 'content-type: application/json' \
  -d '{
    "messages": [{"role": "user", "content": "Help with VAT"}],
    "model": "gpt-4o-mini"
  }'
```

## Frontend
- Do NOT call OpenAI from the browser
- Call backend `POST /api/v1/ai/chat`

## Troubleshooting
- 401/403: check API key present in backend env
- 500: model name typo or quota
- Build errors: ensured by lazy-init (no OpenAI client created at import time)
