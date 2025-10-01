"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Star,
  LocalShipping,
  TrendingUp,
  ShoppingCart,
  ExpandMore,
  ExpandLess,
  EmojiEvents,
  Schedule,
  Favorite,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeBackDashboardProps {
  onAction?: (action: string) => void;
}

export default function WelcomeBackDashboard({ onAction }: WelcomeBackDashboardProps) {
  const [welcomeData, setWelcomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['insights', 'recommendations']));

  useEffect(() => {
    fetchWelcomeData();
  }, []);

  const fetchWelcomeData = async () => {
    try {
      const response = await fetch('/api/welcome-back');
      const data = await response.json();
      setWelcomeData(data);
    } catch (error) {
      console.error('Failed to fetch welcome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleAction = (action: string) => {
    onAction?.(action);
    // Handle specific actions
    switch (action) {
      case 'track_orders':
        window.location.href = '/orders';
        break;
      case 'manage_subscription':
        window.location.href = '/subscriptions';
        break;
      case 'redeem_points':
        window.location.href = '/loyalty';
        break;
      case 'shop_now':
        window.location.href = '/shop';
        break;
      case 'subscribe':
        window.location.href = '/shop?tab=subscriptions';
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading your personalized dashboard...</Typography>
      </Box>
    );
  }

  if (!welcomeData) {
    return (
      <Alert severity="error">
        Failed to load your dashboard. Please try refreshing the page.
      </Alert>
    );
  }

  const { welcomeMessage, customerInsights, recommendations, seasonalOffers, quickActions } = welcomeData;

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              {welcomeMessage.title}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              {welcomeMessage.message}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {welcomeMessage.highlights.map((highlight: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Chip
                    label={highlight}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  />
                </motion.div>
              ))}
            </Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => handleAction(welcomeMessage.actionText.toLowerCase().replace(/\s+/g, '_'))}
                sx={{
                  mt: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {welcomeMessage.actionText}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={3}>
        {/* Customer Insights */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Your ChefPax Journey</Typography>
                  <IconButton onClick={() => toggleSection('insights')}>
                    {expandedSections.has('insights') ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                <Collapse in={expandedSections.has('insights')}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ backgroundColor: '#4CAF50', mx: 'auto', mb: 1 }}>
                          <ShoppingCart />
                        </Avatar>
                        <Typography variant="h4" color="primary">
                          {customerInsights.totalOrders}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ backgroundColor: '#2196F3', mx: 'auto', mb: 1 }}>
                          <TrendingUp />
                        </Avatar>
                        <Typography variant="h4" color="primary">
                          ${customerInsights.totalSpent.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ backgroundColor: '#FF9800', mx: 'auto', mb: 1 }}>
                          <Star />
                        </Avatar>
                        <Typography variant="h4" color="primary">
                          {customerInsights.currentPoints}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Loyalty Points
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ backgroundColor: '#9C27B0', mx: 'auto', mb: 1 }}>
                          <EmojiEvents />
                        </Avatar>
                        <Typography variant="h4" color="primary">
                          {customerInsights.subscriptionTier}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Member Tier
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {customerInsights.favoriteProducts.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Your Favorites
                      </Typography>
                      <List dense>
                        {customerInsights.favoriteProducts.slice(0, 3).map((product: any, index: number) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <Avatar sx={{ backgroundColor: '#4CAF50' }}>
                                🌱
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={product.name}
                              secondary={`Ordered ${product.orderCount} times`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action: any, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleAction(action.action)}
                          sx={{
                            p: 2,
                            height: 'auto',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            textAlign: 'left',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontSize: '1.5rem', mr: 1 }}>
                              {action.icon}
                            </Typography>
                            <Typography variant="subtitle2">
                              {action.title}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Button>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Personalized Recommendations</Typography>
                    <IconButton onClick={() => toggleSection('recommendations')}>
                      {expandedSections.has('recommendations') ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  
                  <Collapse in={expandedSections.has('recommendations')}>
                    <Grid container spacing={2}>
                      {recommendations.map((rec: any, index: number) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {rec.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {rec.description}
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAction(rec.action)}
                                sx={{
                                  background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
                                  },
                                }}
                              >
                                Learn More
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {/* Seasonal Offers */}
        {seasonalOffers.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🌟 Seasonal Special Offers
                  </Typography>
                  <Grid container spacing={2}>
                    {seasonalOffers.map((offer: any, index: number) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {offer.icon} {offer.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {offer.description}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {offer.discount}
                          </Typography>
                          <Typography variant="caption">
                            Valid until {offer.validUntil}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
