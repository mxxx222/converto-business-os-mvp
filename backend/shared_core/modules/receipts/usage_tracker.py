from __future__ import annotations


class UsageTracker:
    def track_receipt_scan(self, client_id: str) -> None:
        # Hook for usage tracking (points/limits)
        return None

    def check_limits(self, client_id: str) -> bool:
        # Placeholder: always allow
        return True

