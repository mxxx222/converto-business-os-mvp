from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class VatReport:
    period: str
    totals: Dict[int, Dict[str, float]]
    client_id: Optional[str] = None


class VatReportService:
    def generate_report(self, period: str, client_id: str | None = None) -> VatReport:
        # Placeholder: fetch receipts by period/client and accumulate VAT totals.
        # Integrate with your Receipt model/query in a follow-up.
        totals: Dict[int, Dict[str, float]] = {}
        return VatReport(period=period, totals=totals, client_id=client_id)

    def export_to_csv(self, report: VatReport) -> str:
        # Simple CSV export placeholder; integrate with NetvisorAdapter if needed.
        import csv, tempfile, os
        fd, path = tempfile.mkstemp(prefix="vat_report_", suffix=".csv")
        os.close(fd)
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["VAT_RATE", "NET", "VAT", "GROSS"])
            for rate, sums in report.totals.items():
                w.writerow([rate, sums.get("net", 0.0), sums.get("vat", 0.0), sums.get("gross", 0.0)])
        return path

