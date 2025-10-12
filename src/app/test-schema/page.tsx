"use client";
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';

export default function TestSchemaPage() {
  const [schemaData, setSchemaData] = useState<any[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Extract schema from the page
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const schemas: any[] = [];
    
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        schemas.push(data);
      } catch (error) {
        console.error('Failed to parse schema:', error);
      }
    });
    
    setSchemaData(schemas);
    
    // Basic validation
    const hasOrganization = schemas.some(s => s['@type'] === 'Organization');
    const hasLocalBusiness = schemas.some(s => s['@type']?.includes('LocalBusiness'));
    const hasWebSite = schemas.some(s => s['@type'] === 'WebSite');
    
    setIsValid(hasOrganization && hasLocalBusiness && hasWebSite);
  }, []);

  const validateSchema = (schema: any) => {
    const issues: string[] = [];
    
    // Check required fields
    if (!schema['@context'] || schema['@context'] !== 'https://schema.org') {
      issues.push('Missing or invalid @context');
    }
    
    if (!schema['@type']) {
      issues.push('Missing @type');
    }
    
    if (schema['@type'] === 'Organization') {
      if (!schema.name) issues.push('Organization missing name');
      if (!schema.url) issues.push('Organization missing url');
      if (!schema.areaServed) issues.push('Organization missing areaServed');
    }
    
    if (schema['@type']?.includes('LocalBusiness')) {
      if (!schema.name) issues.push('LocalBusiness missing name');
      if (!schema.address) issues.push('LocalBusiness missing address');
      if (!schema.areaServed) issues.push('LocalBusiness missing areaServed');
      if (!schema.serviceArea) issues.push('LocalBusiness missing serviceArea');
    }
    
    return issues;
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Schema Testing Dashboard
      </Typography>
      
      <Alert 
        severity={isValid ? 'success' : 'error'} 
        sx={{ mb: 3 }}
      >
        {isValid 
          ? '✅ Schema validation passed - All required schemas found!' 
          : '❌ Schema validation failed - Missing required schemas'
        }
      </Alert>

      <Typography variant="h6" gutterBottom>
        Found {schemaData.length} Schema(s):
      </Typography>

      {schemaData.map((schema, index) => {
        const issues = validateSchema(schema);
        const isSchemaValid = issues.length === 0;
        
        return (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6">
                  Schema #{index + 1}: {Array.isArray(schema['@type']) ? schema['@type'].join(', ') : schema['@type']}
                </Typography>
                <Alert severity={isSchemaValid ? 'success' : 'warning'} sx={{ py: 0 }}>
                  {isSchemaValid ? '✅ Valid' : `⚠️ ${issues.length} issues`}
                </Alert>
              </Box>
              
              {issues.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error">
                    Issues found:
                  </Typography>
                  <ul>
                    {issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </Box>
              )}
              
              <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
                <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🧪 Testing Instructions
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Google Rich Results Test:</strong> Go to{' '}
                <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener">
                  https://search.google.com/test/rich-results
                </a>{' '}
                and test your URL
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Schema.org Validator:</strong> Test at{' '}
                <a href="https://validator.schema.org/" target="_blank" rel="noopener">
                  https://validator.schema.org/
                </a>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>View Page Source:</strong> Right-click → View Page Source and search for "schema.org"
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Browser DevTools:</strong> F12 → Console → Type "document.querySelectorAll('script[type=\"application/ld+json\"]')"
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
