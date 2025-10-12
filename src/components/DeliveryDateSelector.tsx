"use client";
import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { LocalShipping, Schedule, CheckCircle } from '@mui/icons-material';
import {
  getAvailableDeliveryDates,
  calculateRequiredLeadTime,
  getDeliveryWindow,
  type DeliveryDateOption
} from '@/lib/delivery-scheduler';

interface CartItem {
  productId: string;
  name: string;
  qty: number;
  leadTimeDays?: number;
  sizeOz?: number;
}

interface DeliveryDateSelectorProps {
  cartItems: CartItem[];
  selectedDate: string | null;
  onDateChange: (date: string) => void;
}

export default function DeliveryDateSelector({
  cartItems,
  selectedDate,
  onDateChange
}: DeliveryDateSelectorProps) {
  // Calculate required lead time based on cart items
  const requiredLeadTime = React.useMemo(() => {
    return calculateRequiredLeadTime(cartItems);
  }, [cartItems]);
  
  // Get available delivery dates
  const deliveryDates = React.useMemo(() => {
    return getAvailableDeliveryDates(requiredLeadTime);
  }, [requiredLeadTime]);
  
  // Auto-select first available date if none selected
  React.useEffect(() => {
    if (!selectedDate && deliveryDates.length > 0) {
      const firstAvailable = deliveryDates.find(d => d.available);
      if (firstAvailable) {
        onDateChange(firstAvailable.date.toISOString());
      }
    }
  }, [selectedDate, deliveryDates, onDateChange]);
  
  const longestGrowItem = React.useMemo(() => {
    return cartItems.reduce((longest, item) => {
      const itemLeadTime = item.leadTimeDays || (item.sizeOz && item.sizeOz < 50 ? 15 : 10);
      const longestLeadTime = longest.leadTimeDays || 10;
      return itemLeadTime > longestLeadTime ? item : longest;
    }, cartItems[0]);
  }, [cartItems]);
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalShipping sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Select Delivery Date
        </Typography>
      </Box>
      
      {/* Lead time info */}
      <Alert 
        severity="info" 
        icon={<Schedule />}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          <strong>{longestGrowItem?.name}</strong> needs {requiredLeadTime} days to grow.
          {requiredLeadTime > 10 && ' This is a premium item with a longer grow cycle.'}
        </Typography>
      </Alert>
      
      {/* Delivery date options */}
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={selectedDate || ''}
          onChange={(e) => onDateChange(e.target.value)}
        >
          {deliveryDates.map((option, idx) => (
            <Paper
              key={idx}
              elevation={selectedDate === option.date.toISOString() ? 3 : 1}
              sx={{
                mb: 1.5,
                border: selectedDate === option.date.toISOString() 
                  ? '2px solid' 
                  : '1px solid',
                borderColor: selectedDate === option.date.toISOString()
                  ? 'primary.main'
                  : 'divider',
                opacity: option.available ? 1 : 0.6,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: option.available ? 3 : 1
                }
              }}
            >
              <FormControlLabel
                value={option.date.toISOString()}
                disabled={!option.available}
                control={<Radio />}
                label={
                  <Box sx={{ py: 1, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {option.dayOfWeek}, {option.formattedDate}
                      </Typography>
                      
                      {option.available && idx === 0 && (
                        <Chip
                          label="Earliest"
                          size="small"
                          color="success"
                          sx={{ height: 20 }}
                        />
                      )}
                      
                      {!option.available && (
                        <Chip
                          label="Not Ready"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                    
                    {option.available ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          <CheckCircle sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: 'success.main' }} />
                          Delivery window: {getDeliveryWindow(option.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({option.daysUntilDelivery} days from now)
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="error.main">
                        {option.reason}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{ 
                  m: 0,
                  px: 2,
                  py: 1,
                  width: '100%',
                  '& .MuiFormControlLabel-label': {
                    width: '100%'
                  }
                }}
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
      
      {/* Delivery schedule info */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          📅 <strong>Delivery Schedule:</strong> We deliver every Tuesday, Thursday, and Saturday
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          🚚 <strong>Delivery Fee:</strong> $5 flat rate • Austin metro area
        </Typography>
      </Box>
    </Box>
  );
}

