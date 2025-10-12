export default function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is ChefPax delivery-only?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. We farm locally and deliver only—there's no public storefront."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get on-demand delivery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. At checkout you can choose standard local delivery or on-demand via Uber Direct in eligible areas."
        }
      },
      {
        "@type": "Question",
        "name": "How does AI improve quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use three LLM/AI components: production scheduling, computer-vision quality checks, and monitoring alerts to maintain consistency and freshness."
        }
      },
      {
        "@type": "Question",
        "name": "What areas do you deliver to?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We deliver throughout Austin, Travis County, and Williamson County. Our service area extends approximately 40km from central Austin."
        }
      },
      {
        "@type": "Question",
        "name": "How fresh are the microgreens?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All microgreens are grown on-site and delivered within 0-2 days of harvest. Our AI monitoring ensures optimal growing conditions and quality."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
