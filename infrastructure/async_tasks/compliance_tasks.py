"""
Celery tasks for VAT OSS/MOSS automated reporting.
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import List

from .celery_app import celery_app, tracer


@celery_app.task(bind=True, name="infrastructure.async_tasks.compliance.generate_and_submit_vat")
def generate_and_submit_vat(self, tenant_ids: List[str] | None = None, reporting_period: str | None = None):
    from compliance.vat_oss_automation import VATOSSAutomation, VATReportType

    with tracer.start_as_current_span("generate_and_submit_vat") as span:
        tax_api = os.getenv("TAX_ADMIN_API_URL", "https://api.vero.fi/v1")
        api_key = os.getenv("TAX_ADMIN_API_KEY", "")
        automation = VATOSSAutomation(tax_admin_api_url=tax_api, api_key=api_key)

        tenants = tenant_ids or ["tenant_demo"]
        period = reporting_period or datetime.utcnow().strftime("%Y-%m")
        results = []
        for t in tenants:
            report = celery_app.loop.run_until_complete(automation.generate_vat_report(t, period, VATReportType.MONTHLY))  # type: ignore
            if not report:
                results.append({"tenant": t, "status": "no-data"})
                continue
            xml_file = celery_app.loop.run_until_complete(automation.export_report_xml(report))  # type: ignore
            submit = celery_app.loop.run_until_complete(automation.submit_report_to_tax_admin(report, xml_file))  # type: ignore
            results.append({"tenant": t, **submit})
        span.set_attribute("tenant_count", len(tenants))
        return {"period": period, "results": results}


