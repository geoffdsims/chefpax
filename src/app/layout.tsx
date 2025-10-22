import type { Metadata } from "next";
import { CssBaseline } from "@mui/material";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import AxeProvider from "@/components/AxeProvider";
import Schema from "./_components/Schema";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = { 
  title: "ChefPax | Microgreens Delivered in Austin (Delivery or Uber Direct)", 
  description: "Fresh, automated microgreens grown locally and delivered—choose standard delivery or Uber Direct. No storefront.",
  alternates: { canonical: "https://www.chefpax.com/" },
  openGraph: {
    title: "ChefPax | Microgreens Delivered in Austin",
    url: "https://www.chefpax.com/",
    images: [{ url: "https://www.chefpax.com/og.jpg", width: 1200, height: 630 }]
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Mobile-first viewport for SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Google Maps API for Address Validation */}
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          onLoad={() => {
            console.log('Google Maps API loaded successfully');
            console.log('Google object:', window.google);
          }}
          onError={(e) => {
            console.error('Failed to load Google Maps API:', e);
            console.log('API Key being used:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT_SET');
          }}
        />
        
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <AxeProvider>
          <SessionProvider>
            <ThemeProvider>
              <CssBaseline />
              {children}
              <Schema />
            </ThemeProvider>
          </SessionProvider>
        </AxeProvider>
        <Analytics />
      </body>
    </html>
  );
}
