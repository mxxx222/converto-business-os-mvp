from __future__ import annotations


class GDPRService:
    def anonymize_receipt(self, receipt_id: str) -> bool:
        # Implement field-level anonymization as needed
        return bool(receipt_id)

    def delete_receipt(self, receipt_id: str) -> bool:
        # Implement hard-delete or tombstone
        return bool(receipt_id)

