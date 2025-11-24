/**
 * Export utilities for CSV and PDF generation
 * Supports Finnish locale (fi-FI) and Europe/Helsinki timezone
 */

// Use native Intl API for timezone formatting (no external dependency needed)

const TIMEZONE = 'Europe/Helsinki';
const LOCALE = 'fi-FI';

/**
 * Export data to CSV with UTF-8 BOM for Excel compatibility
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string = 'export.csv'
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const rows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Escape commas and quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    )
  ];
  
  const csvContent = rows.join('\n');
  
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for Finnish locale
 */
function formatDateForFinnish(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fi-FI', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format number for Finnish locale
 */
function formatNumberForFinnish(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format currency for Finnish locale
 */
function formatCurrencyForFinnish(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

/**
 * Export data to PDF (client-side using browser print or server-side)
 * For client-side, creates a printable HTML document
 */
export function exportToPDF(
  data: Record<string, unknown>[],
  filename: string = 'export.pdf',
  title: string = 'Raportti'
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create HTML table
  const headers = Object.keys(data[0]);
  const tableRows = data.map(row =>
    `<tr>${headers.map(header => {
      const value = row[header];
      let displayValue = '';
      
      if (value === null || value === undefined) {
        displayValue = '';
      } else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        displayValue = formatDateForFinnish(value as Date | string);
      } else if (typeof value === 'number') {
        // Check if it looks like currency
        if (header.toLowerCase().includes('amount') || header.toLowerCase().includes('price') || header.toLowerCase().includes('summa')) {
          displayValue = formatCurrencyForFinnish(value);
        } else {
          displayValue = formatNumberForFinnish(value);
        }
      } else {
        displayValue = String(value);
      }
      
      return `<td>${displayValue}</td>`;
    }).join('')}</tr>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      color: #000;
    }
    h1 {
      font-size: 18pt;
      margin-bottom: 1cm;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1cm;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      padding: 8px;
      text-align: left;
      border-bottom: 2px solid #000;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid #ccc;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .footer {
      margin-top: 2cm;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <div class="footer">
    Luotu: ${formatDateForFinnish(new Date())} (Europe/Helsinki)
  </div>
</body>
</html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    // Fallback: create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export analytics data with proper Finnish formatting
 */
export function exportAnalytics(
  data: Record<string, unknown>[],
  format: 'csv' | 'pdf' = 'csv',
  title: string = 'Analytiikkaraportti'
): void {
  // Format dates and numbers for Finnish locale
  const formattedData = data.map(row => {
    const formatted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        formatted[key] = formatDateForFinnish(value as Date | string);
      } else if (typeof value === 'number') {
        if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('summa')) {
          formatted[key] = formatCurrencyForFinnish(value);
        } else {
          formatted[key] = formatNumberForFinnish(value);
        }
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  });

  const timestamp = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date()).replace(/[/, ]/g, '_').replace(/:/g, '-');
  const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.${format}`;

  if (format === 'csv') {
    exportToCSV(formattedData, filename);
  } else {
    exportToPDF(formattedData, filename, title);
  }
}

