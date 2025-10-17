import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://fee3f9fe024b4051f7c06c621f589619@o4510202144358401.ingest.us.sentry.io/4510202155630592",
  
  // Enable logs for Sentry
  enableLogs: true,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Send console errors and warnings to Sentry
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
  
  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});


