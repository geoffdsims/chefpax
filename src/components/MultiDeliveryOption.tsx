"use client";
import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { LocalShipping, CalendarToday, CheckCircle, InfoOutlined } from '@mui/icons-material';
import { groupItemsByLeadTime, formatDeliveryDate } from '@/lib/delivery-scheduler';

interface CartItem {
  name: string;
  qty: number;
  leadTimeDays?: number;
  sizeOz?: number;
  priceCents: number;
}

interface MultiDeliveryOptionProps {
  cartItems: CartItem[];
  deliveryMode: 'single' | 'split';
  onModeChange: (mode: 'single' | 'split') => void;
}

export default function MultiDeliveryOption({
  cartItems,
  deliveryMode,
  onModeChange
}: MultiDeliveryOptionProps) {
  const deliveryGroups = React.useMemo(() => {
    return groupItemsByLeadTime(cartItems);
  }, [cartItems]);
  
  // Only show if there are 2+ groups with meaningful time difference
  if (deliveryGroups.length < 2) {
    return null;
  }
  
  const timeSaved = deliveryGroups[deliveryGroups.length - 1].leadTimeDays - deliveryGroups[0].leadTimeDays;
  
  if (timeSaved < 5) {
    return null; // Don't suggest split if less than 5 days difference
  }
  
  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity="info" 
        icon={<InfoOutlined />}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Your cart has items with different grow times
        </Typography>
        <Typography variant="body2">
          We can deliver items as soon as they're ready, or wait and deliver everything together.
        </Typography>
      </Alert>
      
      <RadioGroup
        value={deliveryMode}
        onChange={(e) => onModeChange(e.target.value as 'single' | 'split')}
      >
        {/* Split Delivery Option */}
        <Card 
          sx={{ 
            mb: 2,
            border: deliveryMode === 'split' ? 2 : 1,
            borderColor: deliveryMode === 'split' ? 'success.main' : 'divider',
            cursor: 'pointer'
          }}
          onClick={() => onModeChange('split')}
        >
          <CardContent>
            <FormControlLabel
              value="split"
              control={<Radio />}
              label={
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShipping sx={{ color: 'success.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Split Delivery (Recommended)
                    </Typography>
                    <Chip 
                      label={`Get items ${timeSaved} days sooner!`}
                      color="success"
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Items delivered as soon as they're ready • <strong>FREE extra delivery</strong>
                  </Typography>
                  
                  {deliveryGroups.map((group, idx) => (
                    <Box key={idx} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Delivery {idx + 1}: {formatDeliveryDate(group.earliestDeliveryDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({group.leadTimeDays} days)
                        </Typography>
                      </Box>
                      <List dense sx={{ pl: 3 }}>
                        {group.items.map((item, itemIdx) => (
                          <ListItem key={itemIdx} sx={{ py: 0 }}>
                            <ListItemText 
                              primary={
                                <Typography variant="body2">
                                  {item.qty}× {item.name}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </Box>
              }
              sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
            />
          </CardContent>
        </Card>
        
        {/* Single Delivery Option */}
        <Card 
          sx={{ 
            border: deliveryMode === 'single' ? 2 : 1,
            borderColor: deliveryMode === 'single' ? 'primary.main' : 'divider',
            cursor: 'pointer'
          }}
          onClick={() => onModeChange('single')}
        >
          <CardContent>
            <FormControlLabel
              value="single"
              control={<Radio />}
              label={
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShipping sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Single Delivery
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    All items delivered together when everything is ready
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Delivery: {formatDeliveryDate(deliveryGroups[deliveryGroups.length - 1].earliestDeliveryDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({deliveryGroups[deliveryGroups.length - 1].leadTimeDays} days)
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
            />
          </CardContent>
        </Card>
      </RadioGroup>
      
      <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
        <Typography variant="caption">
          <strong>No extra charge</strong> for split deliveries! We want you to enjoy fresh microgreens as soon as possible.
        </Typography>
      </Alert>
    </Box>
  );
}

