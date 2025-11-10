import type {ReactNode} from 'react';

export const metadata = {
  title: 'DocFlow – Automate your document workflows',
  description:
    'DocFlow digitises and automates receipts and invoices with AI-powered OCR, integrations and approval workflows.'
};

export default function RootLayout({children}: {children: ReactNode}) {
  return children;
}
