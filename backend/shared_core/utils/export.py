"""Export utilities with Finnish localization defaults for DocFlow."""

from __future__ import annotations

import csv
import io
import logging
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum

import pytz
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

logger = logging.getLogger(__name__)


class ExportFormat(str, Enum):
    """Supported export formats."""
    CSV = "csv"
    PDF = "pdf"
    EXCEL = "xlsx"


@dataclass
class LocaleConfig:
    """Localization configuration for exports."""
    locale: str = "fi-FI"
    timezone: str = "Europe/Helsinki"
    currency: str = "EUR"
    currency_symbol: str = "€"
    date_format: str = "%d.%m.%Y"
    datetime_format: str = "%d.%m.%Y %H:%M"
    decimal_separator: str = ","
    thousands_separator: str = " "
    encoding: str = "utf-8"


@dataclass
class ExportConfig:
    """Export configuration."""
    format: ExportFormat
    locale: LocaleConfig = LocaleConfig()
    include_headers: bool = True
    include_metadata: bool = True
    page_size: tuple = A4
    font_name: str = "Helvetica"
    font_size: int = 10
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None


class FinnishFormatter:
    """Finnish localization formatter."""
    
    def __init__(self, config: LocaleConfig):
        self.config = config
        self.timezone = pytz.timezone(config.timezone)
    
    def format_date(self, date: datetime) -> str:
        """Format date in Finnish format."""
        if date.tzinfo is None:
            date = self.timezone.localize(date)
        else:
            date = date.astimezone(self.timezone)
        return date.strftime(self.config.date_format)
    
    def format_datetime(self, dt: datetime) -> str:
        """Format datetime in Finnish format."""
        if dt.tzinfo is None:
            dt = self.timezone.localize(dt)
        else:
            dt = dt.astimezone(self.timezone)
        return dt.strftime(self.config.datetime_format)
    
    def format_currency(self, amount: Union[float, Decimal]) -> str:
        """Format currency in Finnish format."""
        if isinstance(amount, Decimal):
            amount = float(amount)
        
        # Format with Finnish number formatting
        formatted = f"{amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", " ")
        return f"{formatted} {self.config.currency_symbol}"
    
    def format_number(self, number: Union[int, float, Decimal]) -> str:
        """Format number in Finnish format."""
        if isinstance(number, Decimal):
            number = float(number)
        
        if isinstance(number, int):
            return f"{number:,}".replace(",", " ")
        else:
            formatted = f"{number:,.2f}".replace(",", "X").replace(".", ",").replace("X", " ")
            return formatted
    
    def format_percentage(self, value: Union[float, Decimal]) -> str:
        """Format percentage in Finnish format."""
        if isinstance(value, Decimal):
            value = float(value)
        
        formatted = f"{value * 100:.1f}".replace(".", ",")
        return f"{formatted} %"


class CSVExporter:
    """CSV export with Finnish localization."""
    
    def __init__(self, config: ExportConfig):
        self.config = config
        self.formatter = FinnishFormatter(config.locale)
    
    def export(self, data: List[Dict[str, Any]], filename: Optional[str] = None) -> bytes:
        """Export data to CSV format."""
        if not data:
            return b""
        
        output = io.StringIO()
        
        # Use semicolon as delimiter (Finnish Excel standard)
        writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
        
        # Write headers
        if self.config.include_headers and data:
            headers = list(data[0].keys())
            writer.writerow(headers)
        
        # Write data rows
        for row in data:
            formatted_row = []
            for value in row.values():
                formatted_value = self._format_value(value)
                formatted_row.append(formatted_value)
            writer.writerow(formatted_row)
        
        # Add metadata if requested
        if self.config.include_metadata:
            output.write("\n")
            output.write(f"# Luotu: {self.formatter.format_datetime(datetime.now())}\n")
            output.write(f"# Rivejä: {len(data)}\n")
            if self.config.title:
                output.write(f"# Otsikko: {self.config.title}\n")
        
        return output.getvalue().encode(self.config.locale.encoding)
    
    def _format_value(self, value: Any) -> str:
        """Format value according to Finnish conventions."""
        if value is None:
            return ""
        elif isinstance(value, datetime):
            return self.formatter.format_datetime(value)
        elif isinstance(value, (int, float, Decimal)):
            # Check if it's a currency field (heuristic)
            if isinstance(value, (float, Decimal)) and abs(value) > 0.01:
                return self.formatter.format_number(value)
            return str(value)
        else:
            return str(value)


class PDFExporter:
    """PDF export with Finnish localization."""
    
    def __init__(self, config: ExportConfig):
        self.config = config
        self.formatter = FinnishFormatter(config.locale)
        self.styles = getSampleStyleSheet()
        
        # Create Finnish-specific styles
        self.styles.add(ParagraphStyle(
            name='FinnishTitle',
            parent=self.styles['Title'],
            fontSize=16,
            spaceAfter=20,
            alignment=1,  # Center
        ))
        
        self.styles.add(ParagraphStyle(
            name='FinnishHeading',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=10,
        ))
    
    def export(self, data: List[Dict[str, Any]], filename: Optional[str] = None) -> bytes:
        """Export data to PDF format."""
        buffer = io.BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.config.page_size,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm,
        )
        
        # Build content
        story = []
        
        # Title
        if self.config.title:
            title = Paragraph(self.config.title, self.styles['FinnishTitle'])
            story.append(title)
            story.append(Spacer(1, 12))
        
        # Metadata
        if self.config.include_metadata:
            metadata_text = f"""
            <b>Raportti luotu:</b> {self.formatter.format_datetime(datetime.now())}<br/>
            <b>Rivejä yhteensä:</b> {len(data)}<br/>
            <b>Aikavyöhyke:</b> {self.config.locale.timezone}
            """
            metadata = Paragraph(metadata_text, self.styles['Normal'])
            story.append(metadata)
            story.append(Spacer(1, 20))
        
        # Data table
        if data:
            table_data = self._prepare_table_data(data)
            table = Table(table_data)
            
            # Style the table
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
            ]))
            
            story.append(table)
        
        # Footer
        story.append(Spacer(1, 30))
        footer_text = f"DocFlow - Asiakirjojen hallinta | {self.formatter.format_date(datetime.now())}"
        footer = Paragraph(footer_text, self.styles['Normal'])
        story.append(footer)
        
        # Build PDF
        doc.build(story)
        
        return buffer.getvalue()
    
    def _prepare_table_data(self, data: List[Dict[str, Any]]) -> List[List[str]]:
        """Prepare data for PDF table."""
        if not data:
            return []
        
        table_data = []
        
        # Headers
        if self.config.include_headers:
            headers = list(data[0].keys())
            # Translate common headers to Finnish
            translated_headers = []
            for header in headers:
                translated = self._translate_header(header)
                translated_headers.append(translated)
            table_data.append(translated_headers)
        
        # Data rows
        for row in data:
            formatted_row = []
            for value in row.values():
                formatted_value = self._format_value_for_pdf(value)
                formatted_row.append(formatted_value)
            table_data.append(formatted_row)
        
        return table_data
    
    def _translate_header(self, header: str) -> str:
        """Translate common headers to Finnish."""
        translations = {
            'id': 'ID',
            'name': 'Nimi',
            'email': 'Sähköposti',
            'date': 'Päivämäärä',
            'created_at': 'Luotu',
            'updated_at': 'Päivitetty',
            'amount': 'Summa',
            'price': 'Hinta',
            'quantity': 'Määrä',
            'total': 'Yhteensä',
            'status': 'Tila',
            'description': 'Kuvaus',
            'company': 'Yritys',
            'phone': 'Puhelin',
            'address': 'Osoite',
            'city': 'Kaupunki',
            'postal_code': 'Postinumero',
            'country': 'Maa',
        }
        return translations.get(header.lower(), header.title())
    
    def _format_value_for_pdf(self, value: Any) -> str:
        """Format value for PDF display."""
        if value is None:
            return ""
        elif isinstance(value, datetime):
            return self.formatter.format_datetime(value)
        elif isinstance(value, (float, Decimal)):
            # Check if it looks like currency
            if abs(value) > 0.01 and abs(value) < 1000000:
                return self.formatter.format_currency(value)
            return self.formatter.format_number(value)
        elif isinstance(value, int):
            return self.formatter.format_number(value)
        else:
            return str(value)


class ExportService:
    """Main export service with Finnish defaults."""
    
    def __init__(self):
        self.default_config = ExportConfig()
        self.exporters = {
            ExportFormat.CSV: CSVExporter,
            ExportFormat.PDF: PDFExporter,
        }
    
    def export_data(
        self,
        data: List[Dict[str, Any]],
        format: ExportFormat,
        config: Optional[ExportConfig] = None,
        filename: Optional[str] = None
    ) -> bytes:
        """Export data in specified format."""
        
        if not data:
            logger.warning("No data provided for export")
            return b""
        
        # Use provided config or default
        export_config = config or self.default_config
        export_config.format = format
        
        # Get appropriate exporter
        exporter_class = self.exporters.get(format)
        if not exporter_class:
            raise ValueError(f"Unsupported export format: {format}")
        
        # Create exporter and export data
        exporter = exporter_class(export_config)
        
        try:
            result = exporter.export(data, filename)
            logger.info(f"Successfully exported {len(data)} rows to {format}")
            return result
        except Exception as e:
            logger.error(f"Export failed: {e}")
            raise
    
    def create_filename(
        self,
        base_name: str,
        format: ExportFormat,
        include_timestamp: bool = True
    ) -> str:
        """Create filename with Finnish timestamp."""
        formatter = FinnishFormatter(LocaleConfig())
        
        if include_timestamp:
            timestamp = formatter.format_datetime(datetime.now()).replace(":", "-").replace(" ", "_")
            filename = f"{base_name}_{timestamp}.{format.value}"
        else:
            filename = f"{base_name}.{format.value}"
        
        return filename
    
    def get_export_metadata(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get export metadata in Finnish."""
        formatter = FinnishFormatter(LocaleConfig())
        
        return {
            "riveja_yhteensa": len(data),
            "sarakkeet": list(data[0].keys()) if data else [],
            "luotu": formatter.format_datetime(datetime.now()),
            "aikavyohyke": "Europe/Helsinki",
            "kieli": "fi-FI",
            "valuutta": "EUR"
        }


# Global export service instance
export_service = ExportService()


# Convenience functions
def export_to_csv(
    data: List[Dict[str, Any]],
    filename: Optional[str] = None,
    config: Optional[ExportConfig] = None
) -> bytes:
    """Export data to CSV with Finnish defaults."""
    return export_service.export_data(data, ExportFormat.CSV, config, filename)


def export_to_pdf(
    data: List[Dict[str, Any]],
    title: Optional[str] = None,
    filename: Optional[str] = None,
    config: Optional[ExportConfig] = None
) -> bytes:
    """Export data to PDF with Finnish defaults."""
    if config is None:
        config = ExportConfig()
    
    if title:
        config.title = title
    
    return export_service.export_data(data, ExportFormat.PDF, config, filename)


def create_finnish_filename(base_name: str, format: ExportFormat) -> str:
    """Create filename with Finnish timestamp."""
    return export_service.create_filename(base_name, format)

