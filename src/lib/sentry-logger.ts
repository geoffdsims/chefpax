/**
 * Sentry Logger & Error Tracking Utilities
 * Centralized error tracking and structured logging for ChefPax
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Get the Sentry logger instance
 * Use for structured logging instead of console.log
 */
export const { logger } = Sentry;

/**
 * Capture an exception in Sentry with optional context
 * Use in try/catch blocks
 * 
 * @example
 * try {
 *   await processOrder(orderId);
 * } catch (error) {
 *   captureError(error, { orderId, userId });
 * }
 */
export function captureError(error: unknown, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Capture an API error with detailed context
 * Use in API routes to track failures
 * 
 * @example
 * captureApiError(error, {
 *   endpoint: '/api/checkout',
 *   method: 'POST',
 *   userId: session.user.id
 * });
 */
export function captureApiError(error: unknown, context: {
  endpoint: string;
  method?: string;
  userId?: string;
  [key: string]: any;
}) {
  Sentry.setContext("api_error", context);
  Sentry.captureException(error);
}

/**
 * Start a custom span for performance tracking
 * Use to measure important operations
 * 
 * @example
 * const result = await trackSpan(
 *   'http.client',
 *   'GET /api/products',
 *   async () => {
 *     return await fetch('/api/products');
 *   }
 * );
 */
export async function trackSpan<T>(
  op: string,
  name: string,
  callback: () => Promise<T>,
  attributes?: Record<string, string | number>
): Promise<T> {
  return Sentry.startSpan(
    { op, name },
    async (span) => {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      return await callback();
    }
  );
}

/**
 * Track a UI interaction
 * Use for button clicks, form submissions, etc.
 * 
 * @example
 * const handleCheckout = () => {
 *   trackUIInteraction('checkout_button_click', () => {
 *     router.push('/cart');
 *   }, { cartTotal: 99.99 });
 * };
 */
export function trackUIInteraction(
  name: string,
  callback: () => void,
  attributes?: Record<string, string | number>
) {
  Sentry.startSpan(
    { op: "ui.click", name },
    (span) => {
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      callback();
    }
  );
}

/**
 * Set user context for Sentry
 * Call when user signs in to associate errors with users
 * 
 * @example
 * setUserContext({
 *   id: session.user.id,
 *   email: session.user.email,
 *   username: session.user.name
 * });
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 * Call when user signs out
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging context
 * Use to track user journey leading to errors
 * 
 * @example
 * addBreadcrumb('User viewed product', { productId: 'sunflower-10x20' });
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

// Export Sentry instance for advanced usage
export { Sentry };

