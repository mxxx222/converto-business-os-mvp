export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Converto",
    "description": "Automatisoi yrityksesi rutiinit: kirjanpito, ALV-raportointi ja asiakastuki yhdellä ratkaisulla.",
    "url": "https://converto.fi",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "priceValidUntil": "2024-12-31",
      "description": "30 päivän ilmainen kokeilu"
    },
    "provider": {
      "@type": "Organization",
      "name": "Converto",
      "url": "https://converto.fi",
      "logo": "https://converto.fi/logo.png",
      "sameAs": [
        "https://linkedin.com/company/converto",
        "https://twitter.com/converto"
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "50",
      "bestRating": "5"
    },
    "featureList": [
      "Kirjanpidon automaatio",
      "ALV-raportoinnin automaatio",
      "Asiakastuen automaatio",
      "Integraatiot CRM-järjestelmiin",
      "Reaaliaikainen raportointi"
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kuinka paljon aikaa Converto säästää?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Converto säästää keskimäärin 8-15 tuntia viikossa automatisoimalla kirjanpidon, ALV-raportoinnin ja asiakastuen rutiinit."
        }
      },
      {
        "@type": "Question",
        "name": "Onko Converto yhteensopiva nykyisten järjestelmien kanssa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kyllä, Converto integroituu saumattomasti CRM-järjestelmiin, kirjanpito-ohjelmistoihin ja asiakastukityökaluihin."
        }
      },
      {
        "@type": "Question",
        "name": "Kuinka nopeasti Converto on käyttöönotettavissa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Converto on käyttöönotettavissa 7 päivässä. Tarjoamme täyden tuen käyttöönoton aikana."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
