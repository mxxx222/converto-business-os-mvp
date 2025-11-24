import os
import httpx


SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_DEFAULT_CHANNEL = os.getenv("SLACK_DEFAULT_CHANNEL", "#general")

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
WA_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
WA_TO = os.getenv("WHATSAPP_TO")


async def send_slack(text: str, channel: str | None = None) -> bool:
    if not SLACK_BOT_TOKEN:
        return False
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            "https://slack.com/api/chat.postMessage",
            headers={"Authorization": f"Bearer {SLACK_BOT_TOKEN}"},
            json={"channel": channel or SLACK_DEFAULT_CHANNEL, "text": text},
        )
        return r.json().get("ok", False)


async def send_whatsapp(text: str) -> bool:
    if not (TWILIO_SID and TWILIO_TOKEN and WA_FROM and WA_TO):
        return False
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json"
    data = {"From": WA_FROM, "To": WA_TO, "Body": text}
    async with httpx.AsyncClient(timeout=15, auth=(TWILIO_SID, TWILIO_TOKEN)) as c:
        r = await c.post(url, data=data)
        return 200 <= r.status_code < 300
