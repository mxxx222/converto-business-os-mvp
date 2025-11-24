from __future__ import annotations

import csv
import os
import tempfile
from dataclasses import dataclass
from typing import Iterable


@dataclass
class ReceiptRow:
    date: str
    vendor: str
    amount: float
    vat: float
    category: str | None = None
    description: str | None = None


class NetvisorAdapter:
    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.api_key = api_key or os.getenv("NETVISOR_API_KEY", "")
        self.base_url = base_url or os.getenv("NETVISOR_BASE_URL", "https://api.netvisor.fi")

    def export_receipts_csv(self, rows: Iterable[ReceiptRow]) -> str:
        fd, path = tempfile.mkstemp(prefix="netvisor_export_", suffix=".csv")
        os.close(fd)
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["Date", "Vendor", "Amount", "VAT", "Category", "Description"])
            w.writeheader()
            for r in rows:
                w.writerow(
                    {
                        "Date": r.date,
                        "Vendor": r.vendor,
                        "Amount": f"{r.amount:.2f}",
                        "VAT": f"{r.vat:.2f}",
                        "Category": r.category or "",
                        "Description": r.description or "",
                    }
                )
        return path

    def upload_to_netvisor(self, file_path: str) -> bool:
        # Placeholder for Netvisor API call. Keep as a no-op until credentials and endpoint are confirmed.
        # Implement signed upload with required headers when API details are available.
        return os.path.exists(file_path)

