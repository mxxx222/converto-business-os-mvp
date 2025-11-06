"""Adapter for Reporting Agent - Generates PDF/HTML reports."""

import logging
from datetime import datetime
from io import BytesIO
from typing import Any

from ..agent_registry import Agent, AgentMetadata, AgentType

logger = logging.getLogger("converto.agent_orchestrator")


class ReportingAgentAdapter(Agent):
    """Adapter for reporting agent that generates financial reports."""

    def __init__(self):
        pass

    async def execute(self, input_data: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        """Generate a financial report from insights and VAT data.

        Args:
            input_data: Input data (insights, vat_data, period, format)
            context: Execution context

        Returns:
            Report generation result
        """
        try:
            insights = input_data.get("insights", [])
            vat_data = input_data.get("vat_data", {})
            period = input_data.get("period", "monthly")
            format_type = input_data.get("format", "html")  # html, pdf, json

            # Generate report based on format
            if format_type == "pdf":
                report_data = await self._generate_pdf_report(insights, vat_data, period)
            elif format_type == "json":
                report_data = await self._generate_json_report(insights, vat_data, period)
            else:
                report_data = await self._generate_html_report(insights, vat_data, period)

            # Save report to storage if requested
            report_url = None
            if input_data.get("save_to_storage", True):
                report_url = await self._save_to_storage(report_data, format_type, period)

            return {
                "report": report_data if format_type == "json" else None,
                "report_url": report_url,
                "format": format_type,
                "period": period,
                "generated_at": datetime.utcnow().isoformat(),
                "success": True,
            }

        except Exception as e:
            logger.error(f"Reporting Agent execution failed: {e}")
            raise

    async def _generate_html_report(
        self, insights: list[dict[str, Any]], vat_data: dict[str, Any], period: str
    ) -> str:
        """Generate HTML report.

        Args:
            insights: List of financial insights
            vat_data: VAT calculation data
            period: Report period

        Returns:
            HTML report content
        """
        html_content = f"""
<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Talousraportti - {period}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
        }}
        .section {{
            background: white;
            padding: 30px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .section h2 {{
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }}
        .insight {{
            padding: 15px;
            margin: 10px 0;
            background: #f9f9f9;
            border-left: 4px solid #667eea;
            border-radius: 4px;
        }}
        .kpi {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        .kpi-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        .kpi-value {{
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }}
        .kpi-label {{
            opacity: 0.9;
            font-size: 0.9em;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background: #667eea;
            color: white;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Talousraportti</h1>
        <p>Jakso: {period} | Luotu: {datetime.utcnow().strftime('%d.%m.%Y %H:%M')}</p>
    </div>

    <div class="section">
        <h2>📈 KPI:t</h2>
        <div class="kpi">
            <div class="kpi-card">
                <div class="kpi-label">Kokonaiskulut</div>
                <div class="kpi-value">{vat_data.get('total_amount', 0):,.2f} €</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">ALV</div>
                <div class="kpi-value">{vat_data.get('total_vat', 0):,.2f} €</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Vähennettävät kulut</div>
                <div class="kpi-value">{vat_data.get('net_amount', 0):,.2f} €</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">AI Insights</div>
                <div class="kpi-value">{len(insights)}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💡 AI Insights</h2>
        {self._render_insights(insights)}
    </div>

    <div class="section">
        <h2>🧮 ALV-laskelmat</h2>
        <table>
            <tr>
                <th>Kategoria</th>
                <th>ALV-prosentti</th>
                <th>Summa (ALV:n kanssa)</th>
                <th>ALV-määrä</th>
            </tr>
            {self._render_vat_table(vat_data)}
        </table>
    </div>

    <div class="footer">
        <p>Raportti luotu Converto Business OS -järjestelmällä</p>
        <p>© {datetime.utcnow().year} Converto.fi</p>
    </div>
</body>
</html>
        """
        return html_content

    def _render_insights(self, insights: list[dict[str, Any]]) -> str:
        """Render insights as HTML.

        Args:
            insights: List of insights

        Returns:
            HTML string
        """
        if not insights:
            return "<p>Ei insightsseja tässä jaksossa.</p>"

        html = ""
        for insight in insights:
            title = insight.get("title", insight.get("type", "Insight"))
            description = insight.get("description", insight.get("message", ""))
            confidence = insight.get("confidence", 0.0)

            html += f"""
            <div class="insight">
                <strong>{title}</strong> (luottamus: {confidence:.0%})
                <p>{description}</p>
            </div>
            """

        return html

    def _render_vat_table(self, vat_data: dict[str, Any]) -> str:
        """Render VAT data as HTML table.

        Args:
            vat_data: VAT data

        Returns:
            HTML table rows
        """
        categories = vat_data.get("categories", [])

        if not categories:
            return "<tr><td colspan='4'>Ei ALV-tietoja saatavilla</td></tr>"

        rows = ""
        for category in categories:
            rows += f"""
            <tr>
                <td>{category.get('name', 'Muu')}</td>
                <td>{category.get('vat_rate', 0) * 100:.0f}%</td>
                <td>{category.get('total', 0):,.2f} €</td>
                <td>{category.get('vat_amount', 0):,.2f} €</td>
            </tr>
            """

        return rows

    async def _generate_pdf_report(
        self, insights: list[dict[str, Any]], vat_data: dict[str, Any], period: str
    ) -> BytesIO:
        """Generate PDF report (requires pdfkit or WeasyPrint).

        Args:
            insights: List of financial insights
            vat_data: VAT calculation data
            period: Report period

        Returns:
            PDF bytes
        """
        # Generate HTML first
        html_content = await self._generate_html_report(insights, vat_data, period)

        try:
            # Try using WeasyPrint (more reliable)
            from weasyprint import HTML

            pdf_bytes = BytesIO()
            HTML(string=html_content).write_pdf(pdf_bytes)
            pdf_bytes.seek(0)
            return pdf_bytes

        except ImportError:
            logger.warning("WeasyPrint not available, falling back to HTML")
            # Fallback to HTML
            return BytesIO(html_content.encode("utf-8"))

    async def _generate_json_report(
        self, insights: list[dict[str, Any]], vat_data: dict[str, Any], period: str
    ) -> dict[str, Any]:
        """Generate JSON report.

        Args:
            insights: List of financial insights
            vat_data: VAT calculation data
            period: Report period

        Returns:
            JSON report data
        """
        return {
            "period": period,
            "generated_at": datetime.utcnow().isoformat(),
            "insights": insights,
            "vat_data": vat_data,
            "summary": {
                "total_insights": len(insights),
                "total_vat": vat_data.get("total_vat", 0),
                "total_amount": vat_data.get("total_amount", 0),
            },
        }

    async def _save_to_storage(self, report_data: Any, format_type: str, period: str) -> str:
        """Save report to storage (Supabase Storage).

        Args:
            report_data: Report data (HTML string, PDF bytes, or JSON dict)
            format_type: Report format (html, pdf, json)
            period: Report period

        Returns:
            Report URL
        """
        try:
            # In production, save to Supabase Storage
            # For now, return a placeholder URL
            filename = f"financial_report_{period}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{format_type}"

            # TODO: Implement Supabase Storage upload
            # from shared_core.modules.supabase.storage import upload_file
            # url = await upload_file("reports", filename, report_data)

            return f"/storage/reports/{filename}"

        except Exception as e:
            logger.warning(f"Failed to save report to storage: {e}")
            return None

    def get_metadata(self) -> AgentMetadata:
        """Get Reporting Agent metadata."""
        from ..agent_registry import AgentMetadata

        return AgentMetadata(
            agent_id="reporting_agent",
            agent_type=AgentType.REPORTING,
            name="Reporting Agent",
            description="Generates financial reports in HTML, PDF, or JSON format with insights and VAT calculations",
            version="1.0.0",
            capabilities=[
                "report_generation",
                "pdf_export",
                "html_export",
                "json_export",
                "kpi_calculation",
                "data_visualization",
            ],
            input_schema={
                "type": "object",
                "properties": {
                    "insights": {"type": "array", "description": "Financial insights"},
                    "vat_data": {"type": "object", "description": "VAT calculation data"},
                    "period": {
                        "type": "string",
                        "description": "Report period",
                        "default": "monthly",
                    },
                    "format": {
                        "type": "string",
                        "enum": ["html", "pdf", "json"],
                        "default": "html",
                    },
                    "save_to_storage": {"type": "boolean", "default": True},
                },
            },
            output_schema={
                "type": "object",
                "properties": {
                    "report": {"type": "object", "description": "Report data (for JSON format)"},
                    "report_url": {"type": "string", "description": "URL to saved report"},
                    "format": {"type": "string", "description": "Report format"},
                    "period": {"type": "string", "description": "Report period"},
                    "generated_at": {"type": "string", "description": "Generation timestamp"},
                },
            },
            dependencies=["finance_agent", "vat_agent"],
            cost_per_request=0.0,  # No API cost
            avg_response_time_ms=500,
        )

    async def validate_input(self, input_data: dict[str, Any]) -> bool:
        """Validate input data for Reporting Agent.

        Args:
            input_data: Input data to validate

        Returns:
            True if valid, False otherwise
        """
        # Must have insights or vat_data
        has_data = "insights" in input_data or "vat_data" in input_data

        return has_data


