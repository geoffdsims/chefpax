'use client';

import { useState } from 'react';
import { Container, Paper, Typography, Button, TextField, Box, Alert } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import SendIcon from '@mui/icons-material/Send';

export default function TestSocialPage() {
  const [productName, setProductName] = useState('ChefPax Mix Live Tray');
  const [quantity, setQuantity] = useState('5');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const postHarvest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/social-media/post-harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: parseInt(quantity),
          availableDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          imageUrl: '/images/microgeens/chefPax_mix.png',
          specialNotes: 'Extra fresh batch! Perfect for your weekend meals.'
        })
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
          <FacebookIcon sx={{ fontSize: 40, color: '#1877F2' }} />
          <InstagramIcon sx={{ fontSize: 40, color: '#E4405F' }} />
          <Typography variant="h4">📱 Social Media Automation</Typography>
        </Box>

        <Typography variant="body1" paragraph color="text.secondary">
          Test automated posting to Facebook and Instagram for harvest announcements.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Quantity (trays)"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={postHarvest}
            disabled={loading || !productName}
            startIcon={<SendIcon />}
          >
            {loading ? 'Posting...' : 'Post Harvest Announcement'}
          </Button>

          {result && (
            <Alert 
              severity={result.success ? 'success' : 'error'} 
              sx={{ mt: 3 }}
            >
              <Typography variant="body2">
                <strong>{result.message || result.error}</strong>
              </Typography>
              {result.results && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block">
                    Facebook: {result.results.facebook ? '✅ Posted' : '❌ Failed'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Instagram: {result.results.instagram ? '✅ Posted' : '❌ Failed'}
                  </Typography>
                </Box>
              )}
              {result.errors && result.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block">
                    <strong>Errors:</strong>
                  </Typography>
                  {result.errors.map((error: string, index: number) => (
                    <Typography key={index} variant="caption" display="block">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          )}
        </Box>

        <Paper elevation={0} sx={{ mt: 4, p: 3, backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom>
            📋 Social Media Configuration
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Facebook:</strong> {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? '✅ Configured' : '❌ Not configured'}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Instagram:</strong> ⏳ Pending App Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Note: Instagram posting requires instagram_content_publish permission (pending Facebook App Review)
          </Typography>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🚀 Automation Features:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li><Typography variant="body2"><strong>Harvest Announcements:</strong> Auto-post when new harvest is ready</Typography></li>
            <li><Typography variant="body2"><strong>Weekly Schedule:</strong> Post upcoming harvest calendar</Typography></li>
            <li><Typography variant="body2"><strong>Promotions:</strong> Announce special offers and sales</Typography></li>
            <li><Typography variant="body2"><strong>Multi-Platform:</strong> Simultaneous posting to Facebook & Instagram</Typography></li>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

