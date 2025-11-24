from __future__ import annotations

from datetime import datetime


class AuditService:
    def log_action(self, action: str, receipt_id: str, user_id: str | None = None) -> None:
        # Wire into your existing audit/event pipeline if available.
        # Placeholder: no-op
        _ = (action, receipt_id, user_id, datetime.utcnow().isoformat())
        return None

