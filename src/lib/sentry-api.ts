import * as Sentry from "@sentry/nextjs";

export function captureApiError(error: unknown, context?: Record<string, any>) {
  console.error('API Error:', error);
  
  Sentry.captureException(error, {
    tags: {
      component: 'api',
    },
    extra: context,
  });
}

export function captureApiWarning(message: string, context?: Record<string, any>) {
  console.warn('API Warning:', message);
  
  Sentry.captureMessage(message, 'warning', {
    tags: {
      component: 'api',
    },
    extra: context,
  });
}

export function setApiContext(context: Record<string, any>) {
  Sentry.setContext('api', context);
}


