"use client";
import { useEffect } from 'react';
import React from 'react';

// Only import axe-core in development
let axe: any = null;
if (process.env.NODE_ENV === 'development') {
  try {
    axe = require('@axe-core/react');
  } catch (error) {
    console.warn('Failed to load axe-core:', error);
  }
}

interface AxeProviderProps {
  children: React.ReactNode;
}

export default function AxeProvider({ children }: AxeProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && axe) {
      // Configure axe-core with comprehensive WCAG 2.0 rules
      axe(React, {
        // Run accessibility tests after 1000ms delay
        delay: 1000,
        // Include all WCAG 2.0 rules
        rules: {
          // WCAG 2.0 Level A & AA rules
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true },
          'keyboard': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'focus-traps': { enabled: true },
          'focusable-no-name': { enabled: true },
          'heading-order': { enabled: true },
          'html-has-lang': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'meta-refresh': { enabled: true },
          'object-alt': { enabled: true },
          'role-img-alt': { enabled: true },
          'scrollable-region-focusable': { enabled: true },
          'select-name': { enabled: true },
          'svg-img-alt': { enabled: true },
          'td-headers-attr': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'valid-lang': { enabled: true },
          'video-caption': { enabled: true },
          'bypass': { enabled: true },
          'document-title': { enabled: true },
          'frame-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'html-lang-valid': { enabled: true },
          'html-xml-lang-mismatch': { enabled: true },
          'landmark-one-main': { enabled: true },
          'landmark-unique': { enabled: true },
          'meta-viewport': { enabled: true },
          'page-has-heading-one': { enabled: true },
          'region': { enabled: true },
          'skip-link': { enabled: true },
          'tabindex': { enabled: true },
          'button-name': { enabled: true },
          'checkboxgroup': { enabled: true },
          'fieldset': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'hidden-content': { enabled: true },
          'input-button-name': { enabled: true },
          'input-image-alt': { enabled: true },
          'label-title-only': { enabled: true },
          'no-autoplay-audio': { enabled: true },
          'presentation-role-conflict': { enabled: true },
          'radiogroup': { enabled: true },
          'role-img-alt': { enabled: true },
          'scope-attr-valid': { enabled: true },
          'table-duplicate-name': { enabled: true },
          'table-fake-caption': { enabled: true },
          'td-has-header': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-required-children': { enabled: true },
          'aria-required-parent': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'autocomplete-valid': { enabled: true },
          'avoid-inline-spacing': { enabled: true },
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true },
          'duplicate-id': { enabled: true },
          'duplicate-id-aria': { enabled: true },
          'duplicate-id-active': { enabled: true },
          'focusable-modal': { enabled: true },
          'heading-order': { enabled: true },
          'identical-links-same-purpose': { enabled: true },
          'image-redundant-alt': { enabled: true },
          'label-content-name-mismatch': { enabled: true },
          'landmark-contentinfo-is-top-level': { enabled: true },
          'landmark-main-is-top-level': { enabled: true },
          'landmark-no-duplicate-banner': { enabled: true },
          'landmark-no-duplicate-contentinfo': { enabled: true },
          'landmark-no-duplicate-main': { enabled: true },
          'landmark-no-duplicate-navigation': { enabled: true },
          'landmark-roles': { enabled: true },
          'link-in-text-block': { enabled: true },
          'list': { enabled: true },
          'meta-refresh': { enabled: true },
          'nested-interactive': { enabled: true },
          'no-autoplay-audio': { enabled: true },
          'no-duplicate-main': { enabled: true },
          'no-redundant-roles': { enabled: true },
          'p-as-heading': { enabled: true },
          'page-has-heading-one': { enabled: true },
          'presentation-role-conflict': { enabled: true },
          'region': { enabled: true },
          'role-img-alt': { enabled: true },
          'scrollable-region-focusable': { enabled: true },
          'select-name': { enabled: true },
          'skip-link': { enabled: true },
          'tabindex': { enabled: true },
          'table-duplicate-name': { enabled: true },
          'table-fake-caption': { enabled: true },
          'td-has-header': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'valid-lang': { enabled: true },
          'video-caption': { enabled: true },
          'video-description': { enabled: true }
        },
        // Tags to include (WCAG 2.0 Level A & AA)
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
        // Run axe on page load and after route changes
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
        }
      });
      
      console.log('🔍 axe-core accessibility testing enabled for WCAG 2.0 compliance');
    }
  }, []);

  return <>{children}</>;
}
