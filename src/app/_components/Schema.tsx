export default function Schema() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ChefPax",
      "url": "https://www.chefpax.com",
      "logo": "https://www.chefpax.com/logo.png",
      "sameAs": ["https://www.instagram.com/chefpax"],
      "knowsAbout": [
        "microgreens", "live trays", "local delivery",
        "LLM-based production scheduling", "computer vision crop monitoring"
      ],
      "areaServed": [
        { "@type": "City", "name": "Austin" },
        { "@type": "AdministrativeArea", "name": "Travis County" },
        { "@type": "AdministrativeArea", "name": "Williamson County" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness","FoodEstablishment"],
      "name": "ChefPax Microgreens (Delivery Only)",
      "url": "https://www.chefpax.com",
      "image": "https://www.chefpax.com/og.jpg",
      "priceRange": "$$",
      "publicAccess": false,                  // no walk-ins
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "REPLACE_FARM_STREET",
        "addressLocality": "Austin",
        "addressRegion": "TX",
        "postalCode": "REPLACE_ZIP",
        "addressCountry": "US"
      },
      "areaServed": [
        { "@type": "City", "name": "Austin" },
        { "@type": "AdministrativeArea", "name": "Travis County" },
        { "@type": "AdministrativeArea", "name": "Williamson County" }
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": { "@type": "GeoCoordinates", "latitude": 30.2672, "longitude": -97.7431 },
        "geoRadius": 40000
      },
      "additionalProperty": [{
        "@type": "PropertyValue",
        "name": "Automation",
        "value": "AI/LLM-assisted production scheduling, computer vision quality checks, and delivery orchestration."
      }],
      "makesOffer": [{
        "@type": "Offer",
        "name": "Weekly Microgreens Subscription",
        "availability": "https://schema.org/InStock",
        // GoodRelations delivery modes (valid with schema.org)
        "availableDeliveryMethod": [
          "http://purl.org/goodrelations/v1#DeliveryModeOnDemand",   // Uber Direct
          "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"    // local courier/you
        ],
        "shippingDetails": [{
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "5.00", "currency": "USD" },
          "shippingDestination": { "@type": "DefinedRegion", "addressRegion": "TX", "addressCountry": "US" },
          "deliveryTime": { "@type": "ShippingDeliveryTime", "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 2, "unitCode": "d" } }
        }],
        "availableChannel": {
          "@type": "ServiceChannel",
          "serviceUrl": "https://www.chefpax.com/shop",
          "name": "Delivery-only (includes Uber Direct option)"
        }
      }]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ChefPax",
      "url": "https://www.chefpax.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.chefpax.com/search?q={query}",
        "query-input": "required name=query"
      }
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
