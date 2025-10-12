import React from "react";
import Head from "next/head";

type SEOProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  schema?: object[];
};

export default function SEO({ 
  title, 
  description, 
  canonical, 
  image, 
  schema = [] 
}: SEOProps) {
  const site = "https://www.chefpax.com";
  const fullTitle = `${title} | ChefPax`;
  const ogImage = image ?? `${site}/images/chefPax_logo.png`;
  const canonicalUrl = canonical ?? site;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="ChefPax" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* JSON-LD Schema */}
      {schema.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </Head>
  );
}
