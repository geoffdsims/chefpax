"use client";

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

interface Analytics {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  orders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  customers: {
    new: number;
    returning: number;
    total: number;
  };
  products: {
    topSelling: Array<{ name: string; count: number; revenue: number }>;
    totalSold: number;
  };
  production: {
    tasksCompleted: number;
    tasksPending: number;
    completionRate: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>
          Failed to load analytics
        </Typography>
      </Container>
    );
  }

  const MetricCard = ({ title, value, subtitle, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ p: 1, bgcolor: `${color}15`, borderRadius: 2 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        📊 Analytics Dashboard
      </Typography>

      {/* Revenue Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Today's Revenue"
            value={`$${(analytics.revenue.today / 100).toFixed(2)}`}
            subtitle={`Week: $${(analytics.revenue.week / 100).toFixed(0)}`}
            icon={<TrendingUpIcon sx={{ color: '#2E7D32', fontSize: 32 }} />}
            color="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={`$${(analytics.revenue.month / 100).toFixed(2)}`}
            subtitle={`Year: $${(analytics.revenue.year / 100).toFixed(0)}`}
            icon={<TrendingUpIcon sx={{ color: '#1976D2', fontSize: 32 }} />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Orders Today"
            value={analytics.orders.today}
            subtitle={`Week: ${analytics.orders.week} | Month: ${analytics.orders.month}`}
            icon={<ShoppingCartIcon sx={{ color: '#ED6C02', fontSize: 32 }} />}
            color="#ED6C02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={analytics.customers.total}
            subtitle={`New: ${analytics.customers.new} | Returning: ${analytics.customers.returning}`}
            icon={<PeopleIcon sx={{ color: '#9C27B0', fontSize: 32 }} />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Top Selling Products */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalFloristIcon /> Top Selling Products
          </Typography>
          <Box sx={{ mt: 2 }}>
            {analytics.products.topSelling.map((product, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.5,
                  borderBottom: index < analytics.products.topSelling.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                <Typography variant="body1">{product.name}</Typography>
                <Box display="flex" gap={3}>
                  <Typography variant="body2" color="text.secondary">
                    {product.count} sold
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${(product.revenue / 100).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Production Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🌱 Production Metrics
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main">
                  {analytics.production.tasksCompleted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="warning.main">
                  {analytics.production.tasksPending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary.main">
                  {analytics.production.completionRate.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}

