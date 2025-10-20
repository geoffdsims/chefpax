'use client';

import { useSession, signOut } from 'next-auth/react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Box,
  Chip,
  Avatar,
  Button,
  Paper
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  LocalShipping,
  Analytics,
  Sensors,
  ShoppingCart,
  People,
  Settings,
  Logout,
  AdminPanelSettings
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
      {/* Header with User Info */}
      <Paper
        elevation={2}
        sx={{
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="img" src="/logo.png" alt="ChefPax" sx={{ height: 60, borderRadius: 2, bgcolor: 'white', p: 0.5 }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AdminPanelSettings />
                <Typography variant="h4" fontWeight="bold">
                  Admin Dashboard
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || 'Admin'}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="body1">
                  Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'Admin'}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {session?.user?.email}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>

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

