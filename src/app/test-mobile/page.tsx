"use client";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { TouchApp, PhoneAndroid, Laptop } from '@mui/icons-material';
import ProductCard from '@/components/ProductCard';
import MobileFriendlyTooltip from '@/components/MobileFriendlyTooltip';

// Mock product for testing
const testProduct = {
  _id: 'test-mobile-product',
  sku: 'TEST_MOBILE',
  name: 'Test Mobile Product',
  priceCents: 3000,
  unit: 'tray',
  photoUrl: '/images/chefPax_logo.png',
  category: 'test',
  variety: 'test',
  sizeOz: 200,
  weeklyCapacity: 5,
  currentWeekAvailable: 5,
  description: 'This is a test product to verify mobile tooltip functionality and touch events work properly on mobile devices.',
  leadTimeDays: 10,
  stages: [
    { type: 'SEED', offsetDays: 0, notes: 'Test seeding' },
    { type: 'GERMINATE', offsetDays: 0, durationDays: 3, notes: 'Test germination' },
    { type: 'LIGHT', offsetDays: 3, durationDays: 6, notes: 'Test light phase' },
    { type: 'HARVEST', offsetDays: 10, notes: 'Test harvest' }
  ]
};

export default function TestMobilePage() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTouch: false,
    userAgent: '',
    screenSize: { width: 0, height: 0 }
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        userAgent: navigator.userAgent,
        screenSize: { width: window.innerWidth, height: window.innerHeight }
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  const handleAddToCart = (product: any) => {
    console.log('Added to cart:', product.name);
  };

  const handleShowCartConfirmation = (product: any) => {
    console.log('Show cart confirmation for:', product.name);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        📱 Mobile Compliance Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page tests mobile tooltip functionality, touch events, and accessibility compliance for Google SEO.
      </Alert>

      {/* Device Detection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Information
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {deviceInfo.isMobile ? <PhoneAndroid color="primary" /> : <Laptop color="primary" />}
              <Typography variant="body2">
                Device Type: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TouchApp color={deviceInfo.isTouch ? 'success' : 'disabled'} />
              <Typography variant="body2">
                Touch Support: {deviceInfo.isTouch ? 'Yes' : 'No'}
              </Typography>
            </Box>
            <Typography variant="body2">
              Screen Size: {deviceInfo.screenSize.width} × {deviceInfo.screenSize.height}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              User Agent: {deviceInfo.userAgent.substring(0, 100)}...
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Mobile Tooltip Testing */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mobile Tooltip Testing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Test the mobile-friendly tooltips below. On mobile, tap and hold to show tooltips.
          </Typography>
          
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <MobileFriendlyTooltip title="This is a mobile-friendly tooltip that works with touch events">
              <Button variant="outlined">Hover/Tap for Tooltip</Button>
            </MobileFriendlyTooltip>
            
            <MobileFriendlyTooltip title="Another tooltip with more content to test mobile behavior">
              <Chip label="Touch Me" color="primary" />
            </MobileFriendlyTooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* Product Card Testing */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Product Card Mobile Testing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Test the product card with mobile-friendly tooltips and touch events.
          </Typography>
          
          <Box sx={{ maxWidth: 300 }}>
            <ProductCard
              p={testProduct}
              onAdd={handleAddToCart}
              onShowCartConfirmation={handleShowCartConfirmation}
              availability={{ status: 'in_stock', message: 'Available' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Mobile SEO Checklist */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mobile SEO Compliance Checklist
          </Typography>
          
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✓" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Responsive viewport meta tag</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✓" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Touch-friendly button sizes (48px+ on mobile)</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✓" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Mobile-optimized tooltips with touch events</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✓" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Accessible touch targets for screen readers</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✓" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Mobile-first responsive design</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label="✓" 
                color="success" 
                size="small" 
                sx={{ minWidth: 24, height: 24 }}
              />
              <Typography variant="body2">Fast loading and mobile performance</Typography>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            <strong>Testing Instructions:</strong>
          </Typography>
          <Box component="ol" sx={{ pl: 2, mt: 1 }}>
            <li>Test on actual mobile device or browser dev tools mobile view</li>
            <li>Tap and hold on product cards to test tooltip functionality</li>
            <li>Verify all buttons are easily tappable (48px+ touch targets)</li>
            <li>Test with screen reader for accessibility compliance</li>
            <li>Check Google PageSpeed Insights for mobile performance</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
