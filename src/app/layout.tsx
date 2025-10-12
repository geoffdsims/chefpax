import type { Metadata } from "next";
import { CssBaseline } from "@mui/material";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import AxeProvider from "@/components/AxeProvider";
import Schema from "./_components/Schema";

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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
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
      </body>
    </html>
  );
}
