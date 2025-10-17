'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  AttachMoney,
  LocalFlorist,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

type TimeFrame = '24h' | '7d' | '30d';

type GrowRoomMetrics = {
  activeTrays: number;
  avgTemperature: number;
  avgHumidity: number;
  avgLightLux: number;
  optimalConditions: number;
  recentReadings: any[];
  activeTasks: any[];
};

type PricingMetrics = {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    activeSubscriptions: number;
    subscriptionRevenue: number;
  };
  premiumPricing: {
    premiumProductCount: number;
    premiumRevenue: number;
    premiumPercentage: number;
    acceptanceRate: number;
  };
  topProducts: Array<{
    name: string;
    orders: number;
    revenue: number;
    avgPrice: number;
  }>;
  revenueBreakdown: {
    oneTime: number;
    subscription: number;
  };
};

export default function MarketingAnalyticsPage() {
  const [growRoomData, setGrowRoomData] = useState<GrowRoomMetrics | null>(null);
  const [pricingData, setPricingData] = useState<PricingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [growTimeframe, setGrowTimeframe] = useState<TimeFrame>('24h');
  const [pricingTimeframe, setPricingTimeframe] = useState<TimeFrame>('30d');

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [growTimeframe, pricingTimeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [growResponse, pricingResponse] = await Promise.all([
        fetch(`/api/analytics/grow-room-engagement?timeframe=${growTimeframe}`),
        fetch(`/api/analytics/premium-pricing?timeframe=${pricingTimeframe}`),
      ]);

      if (growResponse.ok) {
        const data = await growResponse.json();
        setGrowRoomData(data);
      }

      if (pricingResponse.ok) {
        const data = await pricingResponse.json();
        setPricingData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !growRoomData && !pricingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Playfair Display', mb: 1 }}>
          📊 Real-Time Marketing Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          "Produce as a Service" transparency and premium pricing metrics
        </Typography>
      </Box>

      {/* Grow Room Monitoring Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Playfair Display' }}>
            🌱 Live Grow Room Metrics
          </Typography>
          <ToggleButtonGroup
            value={growTimeframe}
            exclusive
            onChange={(e, value) => value && setGrowTimeframe(value)}
            size="small"
          >
            <ToggleButton value="24h">24h</ToggleButton>
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          {/* Active Trays */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalFlorist sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Active Trays</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {growRoomData?.activeTrays || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Growing now
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Temperature */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">🌡️ Temperature</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {growRoomData?.avgTemperature || 0}°F
                </Typography>
                <Chip
                  size="small"
                  label={growRoomData?.avgTemperature && growRoomData.avgTemperature >= 70 && growRoomData.avgTemperature <= 75 ? 'Optimal' : 'Adjust'}
                  color={growRoomData?.avgTemperature && growRoomData.avgTemperature >= 70 && growRoomData.avgTemperature <= 75 ? 'success' : 'warning'}
                  icon={growRoomData?.avgTemperature && growRoomData.avgTemperature >= 70 && growRoomData.avgTemperature <= 75 ? <CheckCircle /> : <Warning />}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Humidity */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">💧 Humidity</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {growRoomData?.avgHumidity || 0}%
                </Typography>
                <Chip
                  size="small"
                  label={growRoomData?.avgHumidity && growRoomData.avgHumidity >= 60 && growRoomData.avgHumidity <= 70 ? 'Optimal' : 'Adjust'}
                  color={growRoomData?.avgHumidity && growRoomData.avgHumidity >= 60 && growRoomData.avgHumidity <= 70 ? 'success' : 'warning'}
                  icon={growRoomData?.avgHumidity && growRoomData.avgHumidity >= 60 && growRoomData.avgHumidity <= 70 ? <CheckCircle /> : <Warning />}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Optimal Conditions */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Optimal</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {growRoomData?.optimalConditions || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Perfect conditions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Premium Pricing Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Playfair Display' }}>
            💰 Premium Pricing Performance
          </Typography>
          <ToggleButtonGroup
            value={pricingTimeframe}
            exclusive
            onChange={(e, value) => value && setPricingTimeframe(value)}
            size="small"
          >
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="90d">90d</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          {/* Total Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  ${pricingData?.overview.totalRevenue || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pricingData?.overview.totalOrders || 0} orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Premium Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Premium Revenue</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  ${pricingData?.premiumPricing.premiumRevenue || 0}
                </Typography>
                <Typography variant="caption" color="success.main">
                  {pricingData?.premiumPricing.premiumPercentage || 0}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Avg Order Value */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">📊 AOV</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  ${pricingData?.overview.avgOrderValue || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average order value
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Subscriptions */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Subscriptions</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {pricingData?.overview.activeSubscriptions || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ${pricingData?.overview.subscriptionRevenue || 0} MRR
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Top Products Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
          🏆 Top Performing Products
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right"><strong>Orders</strong></TableCell>
                <TableCell align="right"><strong>Revenue</strong></TableCell>
                <TableCell align="right"><strong>Avg Price</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricingData?.topProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">{product.orders}</TableCell>
                  <TableCell align="right">${product.revenue}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`$${product.avgPrice}`}
                      size="small"
                      color={product.avgPrice > 30 ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!pricingData?.topProducts || pricingData.topProducts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No data available for this timeframe
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Revenue Breakdown */}
      {pricingData && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
            💵 Revenue Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary.contrastText">
                  One-Time Orders
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
                  ${pricingData.revenueBreakdown.oneTime}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="success.contrastText">
                  Subscription Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.contrastText' }}>
                  ${pricingData.revenueBreakdown.subscription}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}

