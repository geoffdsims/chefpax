'use client';

import { useSession } from 'next-auth/react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Box,
  Chip
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  LocalShipping,
  Analytics,
  Sensors,
  ShoppingCart,
  People,
  Settings
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const adminTools = [
  {
    title: 'Production Tasks',
    description: 'Manage grow schedule, seeding, harvest',
    icon: <Dashboard />,
    path: '/admin/production',
    color: '#4CAF50',
    status: '✅ Active'
  },
  {
    title: 'Marketing Analytics',
    description: 'Premium pricing, revenue, subscriptions',
    icon: <Analytics />,
    path: '/admin/marketing-analytics',
    color: '#2196F3',
    status: '✅ Active'
  },
  {
    title: 'IoT Monitoring',
    description: 'Sensors, alerts, environmental data',
    icon: <Sensors />,
    path: '/admin/iot-monitoring',
    color: '#FF9800',
    status: '✅ Active'
  },
  {
    title: 'Orders',
    description: 'View and manage customer orders',
    icon: <ShoppingCart />,
    path: '/admin/orders',
    color: '#9C27B0',
    status: '⏳ Coming'
  },
  {
    title: 'Inventory',
    description: 'Stock levels, capacity planning',
    icon: <Inventory />,
    path: '/admin/inventory',
    color: '#F44336',
    status: '⏳ Coming'
  },
  {
    title: 'Delivery',
    description: 'Uber Direct, scheduling, tracking',
    icon: <LocalShipping />,
    path: '/admin/delivery',
    color: '#00BCD4',
    status: '⏳ Coming'
  },
  {
    title: 'Customers',
    description: 'Profiles, subscriptions, preferences',
    icon: <People />,
    path: '/admin/customers',
    color: '#673AB7',
    status: '⏳ Coming'
  },
  {
    title: 'Settings',
    description: 'Products, grow cards, configuration',
    icon: <Settings />,
    path: '/admin/settings',
    color: '#607D8B',
    status: '⏳ Coming'
  }
];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box component="img" src="/logo.png" alt="ChefPax" sx={{ height: 50 }} />
        <Box>
          <Typography variant="h3" sx={{ fontFamily: 'Playfair Display' }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {session?.user?.name || 'Admin'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {adminTools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.path}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea 
                onClick={() => tool.status === '✅ Active' && router.push(tool.path)}
                disabled={tool.status !== '✅ Active'}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <Box 
                      sx={{ 
                        color: tool.color,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {tool.icon}
                    </Box>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {tool.title}
                    </Typography>
                    <Chip 
                      label={tool.status} 
                      size="small"
                      color={tool.status === '✅ Active' ? 'success' : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

