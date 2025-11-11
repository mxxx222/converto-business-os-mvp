"""
EU VAT OSS Compliance Automation
Scheduled tasks for VAT reporting to Finnish Tax Administration
CSV/XML format reporting to Valtiovarainministeriö API
"""

from typing import Dict, List, Any, Optional, Tuple
import asyncio
import csv
import xml.etree.ElementTree as ET
import json
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import httpx
import pandas as pd
from decimal import Decimal, ROUND_HALF_UP

logger = logging.getLogger(__name__)


class VATReportType(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUAL = "annual"
    CORRECTION = "correction"


class VATReportStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CORRECTED = "corrected"


@dataclass
class VATTransaction:
    """VAT transaction data"""
    transaction_id: str
    tenant_id: str
    invoice_number: str
    invoice_date: datetime
    customer_country_code: str
    customer_vat_number: Optional[str]
    service_type: str
    net_amount: Decimal
    vat_rate: Decimal
    vat_amount: Decimal
    total_amount: Decimal
    currency: str = "EUR"
    oss_country_code: str = "FI"
    created_at: datetime = None
    updated_at: datetime = None


@dataclass
class VATReport:
    """VAT OSS report data"""
    report_id: str
    tenant_id: str
    report_type: VATReportType
    reporting_period: str  # YYYY-MM format
    status: VATReportStatus
    transactions: List[VATTransaction]
    total_net_amount: Decimal
    total_vat_amount: Decimal
    total_transactions: int
    created_at: datetime
    submitted_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class VATOSSAutomation:
    """EU VAT OSS compliance automation service"""
    
    def __init__(self, tax_admin_api_url: str, api_key: str):
        self.tax_admin_api_url = tax_admin_api_url
        self.api_key = api_key
        self.reporting_schedules = {}
        self.vat_rates = {
            "FI": Decimal("0.24"),  # Finland 24%
            "DE": Decimal("0.19"),  # Germany 19%
            "FR": Decimal("0.20"),  # France 20%
            "IT": Decimal("0.22"),  # Italy 22%
            "ES": Decimal("0.21"),  # Spain 21%
            "NL": Decimal("0.21"),  # Netherlands 21%
            "BE": Decimal("0.21"),  # Belgium 21%
            "AT": Decimal("0.20"),  # Austria 20%
            "SE": Decimal("0.25"),  # Sweden 25%
            "DK": Decimal("0.25"),  # Denmark 25%
        }
        
        # Service types and their VAT treatment
        self.service_types = {
            "digital_services": {
                "vat_applicable": True,
                "oss_required": True,
                "description": "Digital services (software, streaming, etc.)"
            },
            "consulting": {
                "vat_applicable": True,
                "oss_required": True,
                "description": "Consulting services"
            },
            "education": {
                "vat_applicable": False,
                "oss_required": False,
                "description": "Educational services"
            },
            "healthcare": {
                "vat_applicable": False,
                "oss_required": False,
                "description": "Healthcare services"
            }
        }
    
    async def schedule_vat_reporting(self, tenant_id: str, report_type: VATReportType = VATReportType.MONTHLY):
        """Schedule VAT reporting for tenant"""
        
        try:
            schedule_config = {
                "tenant_id": tenant_id,
                "report_type": report_type,
                "next_report_date": self._calculate_next_report_date(report_type),
                "enabled": True,
                "created_at": datetime.utcnow()
            }
            
            self.reporting_schedules[tenant_id] = schedule_config
            
            # Schedule the next report
            await self._schedule_next_report(tenant_id, schedule_config)
            
            logger.info(f"VAT reporting scheduled for tenant {tenant_id}: {report_type}")
            
        except Exception as e:
            logger.error(f"Failed to schedule VAT reporting for tenant {tenant_id}: {str(e)}")
            raise
    
    async def generate_vat_report(
        self,
        tenant_id: str,
        reporting_period: str,
        report_type: VATReportType = VATReportType.MONTHLY
    ) -> VATReport:
        """Generate VAT OSS report for tenant and period"""
        
        try:
            # Get transactions for the reporting period
            transactions = await self._get_transactions_for_period(tenant_id, reporting_period)
            
            if not transactions:
                logger.warning(f"No transactions found for tenant {tenant_id} in period {reporting_period}")
                return None
            
            # Calculate totals
            total_net_amount = sum(t.net_amount for t in transactions)
            total_vat_amount = sum(t.vat_amount for t in transactions)
            
            # Create report
            report = VATReport(
                report_id=f"VAT_{tenant_id}_{reporting_period}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                tenant_id=tenant_id,
                report_type=report_type,
                reporting_period=reporting_period,
                status=VATReportStatus.DRAFT,
                transactions=transactions,
                total_net_amount=total_net_amount,
                total_vat_amount=total_vat_amount,
                total_transactions=len(transactions),
                created_at=datetime.utcnow()
            )
            
            logger.info(f"Generated VAT report {report.report_id} with {len(transactions)} transactions")
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate VAT report: {str(e)}")
            raise
    
    async def export_report_csv(self, report: VATReport) -> str:
        """Export VAT report to CSV format"""
        
        try:
            csv_filename = f"{report.report_id}.csv"
            
            with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'transaction_id', 'invoice_number', 'invoice_date', 'customer_country_code',
                    'customer_vat_number', 'service_type', 'net_amount', 'vat_rate', 'vat_amount',
                    'total_amount', 'currency', 'oss_country_code'
                ]
                
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for transaction in report.transactions:
                    writer.writerow({
                        'transaction_id': transaction.transaction_id,
                        'invoice_number': transaction.invoice_number,
                        'invoice_date': transaction.invoice_date.strftime('%Y-%m-%d'),
                        'customer_country_code': transaction.customer_country_code,
                        'customer_vat_number': transaction.customer_vat_number or '',
                        'service_type': transaction.service_type,
                        'net_amount': str(transaction.net_amount),
                        'vat_rate': str(transaction.vat_rate),
                        'vat_amount': str(transaction.vat_amount),
                        'total_amount': str(transaction.total_amount),
                        'currency': transaction.currency,
                        'oss_country_code': transaction.oss_country_code
                    })
            
            logger.info(f"Exported VAT report to CSV: {csv_filename}")
            return csv_filename
            
        except Exception as e:
            logger.error(f"Failed to export CSV report: {str(e)}")
            raise
    
    async def export_report_xml(self, report: VATReport) -> str:
        """Export VAT report to XML format for Finnish Tax Administration"""
        
        try:
            xml_filename = f"{report.report_id}.xml"
            
            # Create XML structure according to Finnish Tax Administration format
            root = ET.Element("VATReport")
            root.set("xmlns", "http://tax.fi/oss/vat")
            root.set("version", "1.0")
            
            # Report header
            header = ET.SubElement(root, "Header")
            ET.SubElement(header, "ReportID").text = report.report_id
            ET.SubElement(header, "TenantID").text = report.tenant_id
            ET.SubElement(header, "ReportType").text = report.report_type.value
            ET.SubElement(header, "ReportingPeriod").text = report.reporting_period
            ET.SubElement(header, "CreatedAt").text = report.created_at.isoformat()
            ET.SubElement(header, "Status").text = report.status.value
            
            # Summary
            summary = ET.SubElement(root, "Summary")
            ET.SubElement(summary, "TotalTransactions").text = str(report.total_transactions)
            ET.SubElement(summary, "TotalNetAmount").text = str(report.total_net_amount)
            ET.SubElement(summary, "TotalVATAmount").text = str(report.total_vat_amount)
            ET.SubElement(summary, "Currency").text = "EUR"
            
            # Transactions
            transactions_elem = ET.SubElement(root, "Transactions")
            
            for transaction in report.transactions:
                trans_elem = ET.SubElement(transactions_elem, "Transaction")
                ET.SubElement(trans_elem, "TransactionID").text = transaction.transaction_id
                ET.SubElement(trans_elem, "InvoiceNumber").text = transaction.invoice_number
                ET.SubElement(trans_elem, "InvoiceDate").text = transaction.invoice_date.strftime('%Y-%m-%d')
                ET.SubElement(trans_elem, "CustomerCountryCode").text = transaction.customer_country_code
                
                if transaction.customer_vat_number:
                    ET.SubElement(trans_elem, "CustomerVATNumber").text = transaction.customer_vat_number
                
                ET.SubElement(trans_elem, "ServiceType").text = transaction.service_type
                ET.SubElement(trans_elem, "NetAmount").text = str(transaction.net_amount)
                ET.SubElement(trans_elem, "VATRate").text = str(transaction.vat_rate)
                ET.SubElement(trans_elem, "VATAmount").text = str(transaction.vat_amount)
                ET.SubElement(trans_elem, "TotalAmount").text = str(transaction.total_amount)
                ET.SubElement(trans_elem, "Currency").text = transaction.currency
                ET.SubElement(trans_elem, "OSSCountryCode").text = transaction.oss_country_code
            
            # Write XML file
            tree = ET.ElementTree(root)
            ET.indent(tree, space="  ", level=0)
            tree.write(xml_filename, encoding="utf-8", xml_declaration=True)
            
            logger.info(f"Exported VAT report to XML: {xml_filename}")
            return xml_filename
            
        except Exception as e:
            logger.error(f"Failed to export XML report: {str(e)}")
            raise
    
    async def submit_report_to_tax_admin(self, report: VATReport, xml_file: str) -> Dict[str, Any]:
        """Submit VAT report to Finnish Tax Administration"""
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/xml",
                "Accept": "application/json"
            }
            
            # Read XML file
            with open(xml_file, 'rb') as f:
                xml_content = f.read()
            
            # Submit to Tax Administration API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.tax_admin_api_url}/vat/oss/reports",
                    headers=headers,
                    content=xml_content,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    submission_result = response.json()
                    
                    # Update report status
                    report.status = VATReportStatus.SUBMITTED
                    report.submitted_at = datetime.utcnow()
                    
                    logger.info(f"Successfully submitted VAT report {report.report_id}")
                    
                    return {
                        "success": True,
                        "submission_id": submission_result.get("submission_id"),
                        "status": "submitted",
                        "message": "Report submitted successfully"
                    }
                else:
                    error_message = response.text
                    logger.error(f"Failed to submit VAT report: {error_message}")
                    
                    return {
                        "success": False,
                        "error": error_message,
                        "status": "failed"
                    }
                    
        except Exception as e:
            logger.error(f"Failed to submit report to tax administration: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "status": "failed"
            }
    
    async def check_report_status(self, submission_id: str) -> Dict[str, Any]:
        """Check status of submitted VAT report"""
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.tax_admin_api_url}/vat/oss/reports/{submission_id}/status",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    status_data = response.json()
                    return {
                        "submission_id": submission_id,
                        "status": status_data.get("status"),
                        "processed_at": status_data.get("processed_at"),
                        "message": status_data.get("message")
                    }
                else:
                    return {
                        "submission_id": submission_id,
                        "status": "error",
                        "message": "Failed to check status"
                    }
                    
        except Exception as e:
            logger.error(f"Failed to check report status: {str(e)}")
            return {
                "submission_id": submission_id,
                "status": "error",
                "message": str(e)
            }
    
    async def process_scheduled_reports(self):
        """Process all scheduled VAT reports"""
        
        try:
            current_time = datetime.utcnow()
            
            for tenant_id, schedule in self.reporting_schedules.items():
                if not schedule.get("enabled", False):
                    continue
                
                next_report_date = schedule.get("next_report_date")
                if next_report_date and current_time >= next_report_date:
                    await self._process_tenant_report(tenant_id, schedule)
            
        except Exception as e:
            logger.error(f"Failed to process scheduled reports: {str(e)}")
    
    async def _process_tenant_report(self, tenant_id: str, schedule: Dict[str, Any]):
        """Process VAT report for specific tenant"""
        
        try:
            report_type = schedule["report_type"]
            reporting_period = self._get_reporting_period(report_type)
            
            # Generate report
            report = await self.generate_vat_report(tenant_id, reporting_period, report_type)
            if not report:
                logger.info(f"No transactions to report for tenant {tenant_id}")
                return
            
            # Export to XML
            xml_file = await self.export_report_xml(report)
            
            # Submit to Tax Administration
            submission_result = await self.submit_report_to_tax_admin(report, xml_file)
            
            if submission_result["success"]:
                # Schedule next report
                schedule["next_report_date"] = self._calculate_next_report_date(report_type)
                logger.info(f"Successfully processed VAT report for tenant {tenant_id}")
            else:
                logger.error(f"Failed to submit VAT report for tenant {tenant_id}: {submission_result['error']}")
            
        except Exception as e:
            logger.error(f"Failed to process report for tenant {tenant_id}: {str(e)}")
    
    def _calculate_next_report_date(self, report_type: VATReportType) -> datetime:
        """Calculate next report date based on report type"""
        
        now = datetime.utcnow()
        
        if report_type == VATReportType.MONTHLY:
            # Next month, first day
            if now.month == 12:
                return datetime(now.year + 1, 1, 1)
            else:
                return datetime(now.year, now.month + 1, 1)
        
        elif report_type == VATReportType.QUARTERLY:
            # Next quarter, first day
            current_quarter = (now.month - 1) // 3 + 1
            if current_quarter == 4:
                return datetime(now.year + 1, 1, 1)
            else:
                next_quarter_start = current_quarter * 3 + 1
                return datetime(now.year, next_quarter_start, 1)
        
        elif report_type == VATReportType.ANNUAL:
            # Next year, first day
            return datetime(now.year + 1, 1, 1)
        
        else:
            return now + timedelta(days=30)
    
    def _get_reporting_period(self, report_type: VATReportType) -> str:
        """Get reporting period string"""
        
        now = datetime.utcnow()
        
        if report_type == VATReportType.MONTHLY:
            return now.strftime("%Y-%m")
        elif report_type == VATReportType.QUARTERLY:
            quarter = (now.month - 1) // 3 + 1
            return f"{now.year}-Q{quarter}"
        elif report_type == VATReportType.ANNUAL:
            return str(now.year)
        else:
            return now.strftime("%Y-%m")
    
    async def _get_transactions_for_period(self, tenant_id: str, reporting_period: str) -> List[VATTransaction]:
        """Get VAT transactions for reporting period"""
        
        try:
            # In production, this would query the database
            # For now, return mock data
            
            mock_transactions = [
                VATTransaction(
                    transaction_id=f"TXN_{tenant_id}_001",
                    tenant_id=tenant_id,
                    invoice_number="INV-2024-001",
                    invoice_date=datetime(2024, 1, 15),
                    customer_country_code="DE",
                    customer_vat_number="DE123456789",
                    service_type="digital_services",
                    net_amount=Decimal("100.00"),
                    vat_rate=Decimal("0.19"),
                    vat_amount=Decimal("19.00"),
                    total_amount=Decimal("119.00"),
                    created_at=datetime.utcnow()
                ),
                VATTransaction(
                    transaction_id=f"TXN_{tenant_id}_002",
                    tenant_id=tenant_id,
                    invoice_number="INV-2024-002",
                    invoice_date=datetime(2024, 1, 20),
                    customer_country_code="FR",
                    customer_vat_number="FR987654321",
                    service_type="consulting",
                    net_amount=Decimal("200.00"),
                    vat_rate=Decimal("0.20"),
                    vat_amount=Decimal("40.00"),
                    total_amount=Decimal("240.00"),
                    created_at=datetime.utcnow()
                )
            ]
            
            return mock_transactions
            
        except Exception as e:
            logger.error(f"Failed to get transactions for period: {str(e)}")
            return []
    
    async def _schedule_next_report(self, tenant_id: str, schedule_config: Dict[str, Any]):
        """Schedule next report processing"""
        
        try:
            # In production, this would use a proper task scheduler like Celery or APScheduler
            # For now, just store the schedule
            
            logger.info(f"Scheduled next VAT report for tenant {tenant_id}")
            
        except Exception as e:
            logger.error(f"Failed to schedule next report: {str(e)}")


# Scheduled task runner
class VATReportingScheduler:
    """Scheduler for VAT reporting tasks"""
    
    def __init__(self, vat_automation: VATOSSAutomation):
        self.vat_automation = vat_automation
        self.running = False
    
    async def start_scheduler(self):
        """Start the VAT reporting scheduler"""
        
        self.running = True
        logger.info("VAT reporting scheduler started")
        
        while self.running:
            try:
                await self.vat_automation.process_scheduled_reports()
                await asyncio.sleep(3600)  # Check every hour
                
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    def stop_scheduler(self):
        """Stop the VAT reporting scheduler"""
        self.running = False
        logger.info("VAT reporting scheduler stopped")


# Example usage
async def main():
    """Example usage of VAT OSS automation"""
    
    # Initialize VAT automation
    vat_automation = VATOSSAutomation(
        tax_admin_api_url="https://api.vero.fi/v1",
        api_key="your-tax-admin-api-key"
    )
    
    # Schedule monthly reporting for a tenant
    await vat_automation.schedule_vat_reporting("tenant_demo", VATReportType.MONTHLY)
    
    # Generate a report
    report = await vat_automation.generate_vat_report(
        tenant_id="tenant_demo",
        reporting_period="2024-01",
        report_type=VATReportType.MONTHLY
    )
    
    if report:
        # Export to XML
        xml_file = await vat_automation.export_report_xml(report)
        
        # Submit to Tax Administration
        result = await vat_automation.submit_report_to_tax_admin(report, xml_file)
        print(f"Submission result: {result}")
    
    # Start scheduler
    scheduler = VATReportingScheduler(vat_automation)
    await scheduler.start_scheduler()


if __name__ == "__main__":
    asyncio.run(main())
