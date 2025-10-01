"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  FormControlLabel,
  Chip,
  Divider
} from "@mui/material";
import { Save, Refresh } from "@mui/icons-material";
import type { Product } from "@/lib/schema";

interface SubscriptionSettingsManagerProps {
  // This would typically be used in an admin panel
}

export default function SubscriptionSettingsManager({}: SubscriptionSettingsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch products with subscription settings
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscription-settings');
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  // Update a single product's subscription settings
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch('/api/admin/subscription-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...updates })
      });

      if (!response.ok) throw new Error('Failed to update product');
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, ...updates } : p
      ));
      
      setMessage({ type: 'success', text: 'Product updated successfully' });
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({ type: 'error', text: 'Failed to update product' });
    }
  };

  // Calculate subscription price
  const getSubscriptionPrice = (product: Product): number => {
    if (product.subscriptionPriceCents) {
      return product.subscriptionPriceCents;
    }
    if (product.subscriptionDiscount) {
      return Math.round(product.priceCents * (1 - product.subscriptionDiscount / 100));
    }
    return product.priceCents;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading subscription settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Subscription Settings
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchProducts}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} md={6} lg={4} key={product._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    SKU: {product.sku}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regular Price: ${(product.priceCents / 100).toFixed(2)}
                  </Typography>
                  {product.subscriptionEnabled && (
                    <Typography variant="body2" color="primary">
                      Subscription Price: ${(getSubscriptionPrice(product) / 100).toFixed(2)}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Subscription Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={product.subscriptionEnabled || false}
                      onChange={(e) => updateProduct(product._id!, { 
                        subscriptionEnabled: e.target.checked 
                      })}
                    />
                  }
                  label="Enable Subscriptions"
                />

                {product.subscriptionEnabled && (
                  <Box sx={{ mt: 2 }}>
                    {/* Subscription Discount */}
                    <TextField
                      label="Discount %"
                      type="number"
                      size="small"
                      fullWidth
                      value={product.subscriptionDiscount || 10}
                      onChange={(e) => updateProduct(product._id!, { 
                        subscriptionDiscount: parseInt(e.target.value) || 0 
                      })}
                      sx={{ mb: 2 }}
                      helperText="Percentage discount for subscribers"
                    />

                    {/* Custom Subscription Price */}
                    <TextField
                      label="Custom Subscription Price ($)"
                      type="number"
                      step="0.01"
                      size="small"
                      fullWidth
                      value={product.subscriptionPriceCents ? (product.subscriptionPriceCents / 100).toFixed(2) : ''}
                      onChange={(e) => updateProduct(product._id!, { 
                        subscriptionPriceCents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined
                      })}
                      sx={{ mb: 2 }}
                      helperText="Leave empty to use discount calculation"
                    />

                    {/* Stripe Price ID */}
                    <TextField
                      label="Stripe Subscription Price ID"
                      size="small"
                      fullWidth
                      value={product.stripeSubscriptionPriceId || ''}
                      onChange={(e) => updateProduct(product._id!, { 
                        stripeSubscriptionPriceId: e.target.value || undefined
                      })}
                      helperText="Stripe Price ID for this product's subscription"
                    />
                  </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Chip 
                    label={product.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={product.unit} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          How to Set Up Stripe Subscriptions
        </Typography>
        <Typography variant="body2" paragraph>
          1. Go to your Stripe Dashboard → Products
        </Typography>
        <Typography variant="body2" paragraph>
          2. Create a new Product for each microgreen variety
        </Typography>
        <Typography variant="body2" paragraph>
          3. Add a Recurring Price (weekly/monthly) for each product
        </Typography>
        <Typography variant="body2" paragraph>
          4. Copy the Price ID (starts with "price_") and paste it above
        </Typography>
        <Typography variant="body2">
          5. Enable subscriptions for the products you want to offer
        </Typography>
      </Box>
    </Box>
  );
}
