import "./globals.css";

export const metadata = {
  title: "DocFlow by Converto – Automatisoi dokumentit AI:lla",
  description: "DocFlow (by Converto). OCR + AI + suorat integraatiot Netvisoriin, Procountoriin ja Vero.fi:hin. Säästä jopa 70 % taloushallinnon työstä – ilman järjestelmävaihtoa.",
  keywords: "netvisor automaatio, ostolaskut ocr, kuittien skannaus, kirjanpito automaatio, y-tunnus tarkistus, alv ilmoitus automaatio, dokumenttien digitointi, taloushallinto ai, docflow, converto",
  authors: [{ name: "DocFlow by Converto" }],
  creator: "DocFlow by Converto",
  publisher: "DocFlow by Converto",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://converto.fi"),
  alternates: {
    canonical: "/",
    languages: {
      "fi-FI": "/",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "DocFlow by Converto – Automatisoi dokumentit AI:lla",
    description: "OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.",
    url: "https://converto.fi",
    siteName: "DocFlow by Converto",
    images: [
      {
        url: "/og-docflow.jpg",
        width: 1200,
        height: 630,
        alt: "DocFlow by Converto – Automatisoi dokumentit AI:lla",
      },
    ],
    locale: "fi_FI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocFlow by Converto – Automatisoi dokumentit AI:lla",
    description: "OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.",
    images: ["/og-docflow.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fi">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.converto.fi" />
        <link rel="preconnect" href="https://calendly.com" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//resend.com" />
        <link rel="dns-prefetch" href="//plausible.io" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
