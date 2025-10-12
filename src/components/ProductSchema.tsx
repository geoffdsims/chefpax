interface ProductSchemaProps {
  name: string;
  image: string;
  description: string;
  price: string;
  availability?: string;
  url?: string;
}

export default function ProductSchema({ 
  name, 
  image, 
  description, 
  price, 
  availability = "https://schema.org/InStock",
  url = "https://www.chefpax.com/shop"
}: ProductSchemaProps) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "image": [image],
    "description": description,
    "brand": { "@type": "Brand", "name": "ChefPax" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": price,
      "availability": availability,
      "url": url,
      "availableDeliveryMethod": [
        "http://purl.org/goodrelations/v1#DeliveryModeOnDemand",
        "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}
