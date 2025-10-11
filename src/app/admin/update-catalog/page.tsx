'use client';

import { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function UpdateCatalogPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const updateProducts = async () => {
    if (!confirm('This will replace ALL products in the database with the latest from code. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/update-products', {
        method: 'POST'
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <RefreshIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4">Update Product Catalog</Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ Warning:</strong> This will DELETE all products from MongoDB and replace them with the latest 13 varieties from code.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Use this after deploying new product updates to sync the database.
          </Typography>
        </Alert>

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={updateProducts}
          disabled={loading}
          startIcon={<RefreshIcon />}
        >
          {loading ? 'Updating...' : 'Update Product Catalog'}
        </Button>

        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'} 
            sx={{ mt: 3 }}
            icon={result.success ? <CheckCircleIcon /> : undefined}
          >
            {result.success ? (
              <Box>
                <Typography variant="body2">
                  <strong>✅ Products Updated Successfully!</strong>
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Deleted: {result.deleted} old products
                </Typography>
                <Typography variant="caption" display="block">
                  Inserted: {result.inserted} new products
                </Typography>
                {result.products && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" display="block">
                      <strong>Products in database:</strong>
                    </Typography>
                    {result.products.map((p: any, i: number) => (
                      <Typography key={i} variant="caption" display="block">
                        • {p.name} ({p.sku})
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2">
                <strong>Error:</strong> {result.error || result.message}
              </Typography>
            )}
          </Alert>
        )}

        <Paper elevation={0} sx={{ mt: 4, p: 3, backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom>
            📋 Current Product Lineup
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Core Line (10×20):</strong> Sunflower, Peas, Radish, Broccoli, Kohlrabi, Superfood Mix, Wasabi Mustard
          </Typography>
          <Typography variant="body2">
            <strong>Premium Line (5×5):</strong> Amaranth, Basil Dark Opal, Basil Lemon, Basil Thai, Shiso
          </Typography>
        </Paper>
      </Paper>
    </Container>
  );
}

