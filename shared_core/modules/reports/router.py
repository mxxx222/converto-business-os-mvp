"""API router for Reports generation."""

from __future__ import annotations

import io
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from fastapi import Request

from shared_core.utils.auth import get_current_tenant_id, get_current_user_id
from shared_core.utils.db import get_session

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_period_dates(period: str) -> tuple[datetime, datetime]:
    """Määritä ajanjakso."""
    now = datetime.now()

    if period == "current_month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    elif period == "last_month":
        first_day = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
        end_date = now.replace(day=1) - timedelta(days=1)
        start_date = first_day
    elif period == "current_quarter":
        quarter = (now.month - 1) // 3
        start_date = now.replace(
            month=quarter * 3 + 1, day=1, hour=0, minute=0, second=0, microsecond=0
        )
        end_date = now
    elif period == "current_year":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    else:
        raise ValueError("Invalid period")

    return start_date, end_date


@router.post("/generate")
async def generate_reports(
    request: Request,
    period: str = Query("current_month", description="Time period for report"),
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Generoi raportit (ALV, kassavirta, tulot, menot, asiakkaat)."""
    try:
        get_current_user_id(request)
        get_current_tenant_id(request)
        start_date, end_date = get_period_dates(period)

        # TODO: Hae kuitit tietokannasta
        # receipts = db.query(Receipt).filter(
        #     Receipt.team_id == user_id,
        #     Receipt.created_at >= start_date,
        #     Receipt.created_at <= end_date,
        #     Receipt.status == 'processed'
        # ).all()

        # Mock data for now
        receipts = []

        # Generoi raportit
        reports = []

        # 1. ALV-RAPORTTI
        gross_amount = 10000.0  # sum(float(r.amount) for r in receipts)
        vat_amount = 2400.0  # sum(float(r.vat_amount) for r in receipts)
        deductions = vat_amount * 0.5
        payable = vat_amount - deductions

        reports.append(
            {
                "type": "vat",
                "period": period,
                "data": {
                    "gross_amount": round(gross_amount, 2),
                    "vat_amount": round(vat_amount, 2),
                    "vat_rate": 0.24,
                    "deductions": round(deductions, 2),
                    "payable": round(payable, 2),
                    "previous_balance": 500.0,
                    "total_payable": round(payable + 500.0, 2),
                },
            }
        )

        # 2. KASSAVIRTA-RAPORTTI
        by_category = {
            "Palkat": 4000.0,
            "Vuokra": 2000.0,
            "Muut": 2000.0,
        }

        reports.append(
            {
                "type": "cashflow",
                "period": period,
                "data": {
                    "income": round(gross_amount, 2),
                    "expenses": round(gross_amount * 0.5, 2),
                    "net": round(gross_amount * 0.5, 2),
                    "opening_balance": 5000.0,
                    "closing_balance": round(5000 + (gross_amount * 0.5), 2),
                    "by_category": {k: round(v, 2) for k, v in by_category.items()},
                },
            }
        )

        # 3. TULORAPORTTI
        by_customer = {
            "Asiakas A": 5000.0,
            "Asiakas B": 4000.0,
            "Muut": 6000.0,
        }

        reports.append(
            {
                "type": "income",
                "period": period,
                "data": {
                    "total": round(gross_amount, 2),
                    "by_category": {k: round(v, 2) for k, v in by_category.items()},
                    "by_customer": {k: round(v, 2) for k, v in by_customer.items()},
                },
            }
        )

        # 4. MENOJEN RAPORTTI
        reports.append(
            {
                "type": "expenses",
                "period": period,
                "data": {
                    "total": round(gross_amount * 0.5, 2),
                    "by_category": {k: round(v, 2) for k, v in by_category.items()},
                },
            }
        )

        # 5. ASIAKASRAPORTTI
        top_customers = [
            {"name": "Asiakas A", "revenue": 5000.0, "transactions": 12},
            {"name": "Asiakas B", "revenue": 4000.0, "transactions": 8},
            {"name": "Asiakas C", "revenue": 3000.0, "transactions": 6},
        ]

        reports.append(
            {
                "type": "customers",
                "period": period,
                "data": {
                    "total_customers": 12,
                    "new_customers": 3,
                    "top_customers": [
                        {
                            "name": customer["name"],
                            "revenue": round(customer["revenue"], 2),
                            "transactions": customer["transactions"],
                        }
                        for customer in top_customers
                    ],
                },
            }
        )

        return {
            "reports": reports,
            "generated_at": datetime.now().isoformat(),
            "period": period,
            "receipt_count": len(receipts),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/download")
async def download_report(
    request: Request,
    report_type: str = Query(
        ..., description="Report type (vat, cashflow, income, expenses, customers)"
    ),
    period: str = Query("current_month", description="Time period"),
    format: str = Query("pdf", description="File format"),
    db: Session = Depends(get_session),
):
    """Lataa raportti PDF-muodossa."""
    try:
        if format != "pdf":
            raise HTTPException(status_code=400, detail="Only PDF format is supported")

        if not REPORTLAB_AVAILABLE:
            raise HTTPException(
                status_code=503, detail="PDF generation not available - reportlab not installed"
            )

        # Generoi raportti
        get_current_user_id(request)
        report_data = await generate_reports(period, request, db)

        # Etsi oikea raportti
        report = next((r for r in report_data["reports"] if r["type"] == report_type), None)
        if not report:
            raise HTTPException(status_code=404, detail=f"Report type {report_type} not found")

        # Luo PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Otsikko
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=24,
            textColor=colors.HexColor("#22C55E"),
            spaceAfter=30,
        )
        elements.append(Paragraph(f"{report_type.upper()} Report - {period}", title_style))
        elements.append(Spacer(1, 0.3 * 1.2))

        # Taulukko
        data = [["Metriikka", "Arvo"]]
        for key, value in report["data"].items():
            if isinstance(value, dict):
                for sub_key, sub_value in value.items():
                    data.append([f"{key} - {sub_key}", f"{sub_value}"])
            elif isinstance(value, list):
                for idx, item in enumerate(value):
                    if isinstance(item, dict):
                        for item_key, item_value in item.items():
                            data.append([f"{key}[{idx}] - {item_key}", f"{item_value}"])
                    else:
                        data.append([f"{key}[{idx}]", f"{item}"])
            else:
                data.append([key, f"{value}"])

        table = Table(data)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#22C55E")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 14),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)

        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={report_type}-{period}.pdf"},
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
