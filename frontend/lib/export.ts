/** @fileoverview Export utilities with fi-FI locale and Europe/Helsinki timezone defaults */

export function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

export function exportCsv(rows: any[]) {
  const csv = toCsv(rows);
  const BOM = '\uFEFF';
  return new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
}

export function htmlToPdf(html: string, options?: { 
  locale?: string; 
  timeZone?: string; 
  format?: string; 
}) {
  const locale = options?.locale || 'fi-FI';
  const timeZone = options?.timeZone || 'Europe/Helsinki';
  const format = options?.format || 'A4';
  
  // Mock PDF generation - in real implementation, you'd use a library like Puppeteer
  // or jsPDF with proper locale and timezone settings
  const pdfContent = `
    %PDF-1.4
    1 0 obj
    <<
    /Type /Catalog
    /Pages 2 0 R
    /Locale ${locale}
    /TimeZone ${timeZone}
    >>
    endobj
    
    2 0 obj
    <<
    /Type /Pages
    /Kids [3 0 R]
    /Count 1
    /MediaBox [0 0 595 842]
    /Format ${format}
    >>
    endobj
    
    3 0 obj
    <<
    /Type /Page
    /Parent 2 0 R
    /Contents 4 0 R
    /Resources <<
    /Font <<
    /F1 5 0 R
    >>
    >>
    >>
    endobj
    
    4 0 obj
    <<
    /Length ${html.length}
    >>
    stream
    ${html}
    endstream
    endobj
    
    5 0 obj
    <<
    /Type /Font
    /Subtype /Type1
    /BaseFont /Helvetica
    >>
    endobj
    
    xref
    0 6
    0000000000 65535 f 
    0000000010 00000 n 
    0000000053 00000 n 
    0000000102 00000 n 
    0000000287 00000 n 
    0000000620 00000 n 
    trailer
    <<
    /Size 6
    /Root 1 0 R
    >>
    startxref
    700
    %%EOF
  `;
  
  return pdfContent;
}

export async function exportPdf(html: string, options?: { 
  locale?: string; 
  timeZone?: string; 
  format?: string; 
}) {
  const pdf = await htmlToPdf(html, { 
    locale: 'fi-FI', 
    timeZone: 'Europe/Helsinki', 
    format: 'A4',
    ...options 
  });
  return new Response(pdf, { 
    headers: { 'Content-Type': 'application/pdf' } 
  });
}