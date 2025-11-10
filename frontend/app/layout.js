import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "DocFlow – Automatisoi dokumentit AI:lla",
  description:
    "DocFlow automatisoi ostolaskujen ja kuittien käsittelyn. OCR + AI + integraatiot Netvisoriin, Procountoriin ja Vero.fi:hin. Säästä jopa 70 % taloushallinnon työstä ilman järjestelmävaihtoa.",
  keywords:
    "docflow, taloushallinto automaatio, netvisor automaatio, ostolaskut ocr, kuittien skannaus, kirjanpito automaatio, y-tunnus tarkistus, alv ilmoitus automaatio, dokumenttien digitointi",
  authors: [{ name: "DocFlow" }],
  creator: "DocFlow",
  publisher: "DocFlow",
  metadataBase: new URL("https://docflow.fi"),
  alternates: {
    canonical: "/",
    languages: {
      fi: "https://docflow.fi/fi",
      en: "https://docflow.fi/en",
      sv: "https://docflow.fi/sv",
      no: "https://docflow.fi/no",
      da: "https://docflow.fi/da",
      de: "https://docflow.fi/de",
      fr: "https://docflow.fi/fr",
      es: "https://docflow.fi/es",
      it: "https://docflow.fi/it",
      nl: "https://docflow.fi/nl",
      pl: "https://docflow.fi/pl",
      ru: "https://docflow.fi/ru",
      ja: "https://docflow.fi/ja",
      zh: "https://docflow.fi/zh",
      ko: "https://docflow.fi/ko",
      "x-default": "https://docflow.fi",
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "DocFlow – Automatisoi dokumentit AI:lla",
    description:
      "OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.",
    url: "https://docflow.fi",
    siteName: "DocFlow",
    images: [
      {
        url: "/og-docflow.jpg",
        width: 1200,
        height: 630,
        alt: "DocFlow – Automatisoi dokumentit AI:lla",
      },
    ],
    locale: "fi_FI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@docflowfi",
    title: "DocFlow – Automatisoi dokumentit AI:lla",
    description:
      "OCR + AI + integraatiot Netvisoriin/Procountoriin ja Vero.fi-lähetys. 15 minuutin käyttöönotto.",
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
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="docflow.fi"
          strategy="afterInteractive"
        />
        <Script
          id="schema-org-organization"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "DocFlow",
            url: "https://docflow.fi",
          logo: "https://docflow.fi/logo.png",
          sameAs: [
            "https://www.linkedin.com/company/docflow-fi",
            "https://x.com/docflowfi",
            "https://www.facebook.com/docflowfi",
            "https://www.youtube.com/@docflowfi",
            "https://www.instagram.com/docflowfi",
          ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer support",
                availableLanguage: ["fi", "en"],
              },
            ],
          })}
        </Script>
        <Script id="schema-org-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://docflow.fi",
            name: "DocFlow",
            // Enable when search is available:
            // potentialAction: [
            //   {
            //     "@type": "SearchAction",
            //     target: "https://docflow.fi/search?q={query}",
            //     "query-input": "required name=query",
            //   },
            // ],
          })}
        </Script>
        <Script
          id="schema-org-navigation"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            name: ["Hinnasto", "Integraatiot", "Tietoturva", "Yhteys", "Aloita ilmaiseksi"],
            url: [
              "https://docflow.fi/pricing",
              "https://docflow.fi/integrations",
              "https://docflow.fi/security",
              "https://docflow.fi/contact",
              "https://docflow.fi/signup",
            ],
          })}
        </Script>
      </body>
    </html>
  );
}
