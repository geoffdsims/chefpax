"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  LocalShipping,
  CheckCircle,
  AccessTime,
  Visibility,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderTrackingCalendarProps {
  orders: any[];
  onOrderSelect?: (order: any) => void;
}

interface CalendarDay {
  date: Date;
  orders: any[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function OrderTrackingCalendar({ orders, onOrderSelect }: OrderTrackingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  // Generate calendar days
  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.deliveryDate);
        return orderDate.toDateString() === currentDate.toDateString();
      });

      days.push({
        date: new Date(currentDate),
        orders: dayOrders,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getOrderStatusColor = (status: string): string => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'out_for_delivery': return '#2196F3';
      case 'ready': return '#FF9800';
      case 'growing': return '#8BC34A';
      case 'processing': return '#9C27B0';
      case 'paid': return '#607D8B';
      default: return '#9E9E9E';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle />;
      case 'out_for_delivery': return <LocalShipping />;
      case 'ready': return <AccessTime />;
      case 'growing': return <CalendarToday />;
      default: return <CalendarToday />;
    }
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setDialogOpen(true);
    onOrderSelect?.(order);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">
          Order Tracking Calendar
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('calendar')}
            size="small"
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('timeline')}
            size="small"
          >
            Timeline
          </Button>
        </Box>
      </Box>

      {viewMode === 'calendar' ? (
        <Card>
          <CardContent>
            {/* Month Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button onClick={handlePrevMonth}>← Previous</Button>
              <Typography variant="h6">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Typography>
              <Button onClick={handleNextMonth}>Next →</Button>
            </Box>

            {/* Calendar Grid */}
            <Grid container spacing={1}>
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Grid item xs key={day}>
                  <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', p: 1 }}>
                    {day}
                  </Typography>
                </Grid>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, index) => (
                <Grid item xs key={index}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      sx={{
                        minHeight: 100,
                        cursor: day.orders.length > 0 ? 'pointer' : 'default',
                        backgroundColor: day.isToday ? '#e3f2fd' : 'transparent',
                        border: day.isToday ? '2px solid #2196F3' : '1px solid #e0e0e0',
                        opacity: day.isCurrentMonth ? 1 : 0.4,
                        '&:hover': day.orders.length > 0 ? {
                          backgroundColor: '#f5f5f5',
                          boxShadow: 2,
                        } : {},
                      }}
                      onClick={() => day.orders.length > 0 && handleOrderClick(day.orders[0])}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="body2" sx={{ fontWeight: day.isToday ? 'bold' : 'normal' }}>
                          {day.date.getDate()}
                        </Typography>
                        
                        {day.orders.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {day.orders.slice(0, 2).map((order, orderIndex) => (
                              <Chip
                                key={orderIndex}
                                label={order.status}
                                size="small"
                                sx={{
                                  backgroundColor: getOrderStatusColor(order.status),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20,
                                  mb: 0.5,
                                }}
                              />
                            ))}
                            {day.orders.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{day.orders.length - 2} more
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ) : (
        /* Timeline View */
        <Box>
          {orders.slice(0, 10).map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => handleOrderClick(order)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ backgroundColor: getOrderStatusColor(order.status), mr: 2 }}>
                      {getOrderStatusIcon(order.status)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        Order #{order._id?.toString().slice(-8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.status}
                      sx={{
                        backgroundColor: getOrderStatusColor(order.status),
                        color: 'white',
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Items: {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: ${(order.totalCents / 100).toFixed(2)}
                    </Typography>
                  </Box>

                  {order.lifecycle && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Progress:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={order.deliveryStatus?.progress || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {order.deliveryStatus?.message}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Order Details
          <IconButton onClick={() => setDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Order Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order #{selectedOrder._id?.toString().slice(-8)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={selectedOrder.status}
                    sx={{
                      backgroundColor: getOrderStatusColor(selectedOrder.status),
                      color: 'white',
                    }}
                  />
                  <Chip
                    label={`$${(selectedOrder.totalCents / 100).toFixed(2)}`}
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Order Timeline */}
              {selectedOrder.lifecycle && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Progress
                  </Typography>
                  <Stepper orientation="vertical">
                    {selectedOrder.lifecycle.stages.map((stage: any, index: number) => (
                      <Step key={stage.id} active={stage.status === 'active'} completed={stage.status === 'completed'}>
                        <StepLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{stage.icon}</Typography>
                            <Typography variant="body2">{stage.name}</Typography>
                            {stage.status === 'completed' && <CheckCircle color="success" fontSize="small" />}
                            {stage.status === 'active' && <AccessTime color="primary" fontSize="small" />}
                          </Box>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary">
                            {stage.description}
                          </Typography>
                          {stage.details && (
                            <Typography variant="caption" color="text.secondary">
                              {stage.details}
                            </Typography>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              )}

              {/* Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Items Ordered
                </Typography>
                <List>
                  {selectedOrder.items.map((item: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#4CAF50' }}>
                          🌱
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${item.qty}x ${item.name}`}
                        secondary={`$${(item.priceCents / 100).toFixed(2)} each`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Delivery Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Delivery Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Window:</strong> {selectedOrder.deliveryWindow || '9:00 AM - 1:00 PM'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Address:</strong> {selectedOrder.address1}, {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zip}
                </Typography>
                {selectedOrder.trackingNumber && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Tracking:</strong> {selectedOrder.trackingNumber}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            // Navigate to full order details page
            window.location.href = `/orders/${selectedOrder._id}`;
          }}>
            View Full Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
