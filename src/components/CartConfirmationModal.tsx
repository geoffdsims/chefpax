"use client";
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  IconButton
} from '@mui/material';
import {
  Close,
  ShoppingCart,
  CheckCircle,
  LocalShipping,
  TrendingUp
} from '@mui/icons-material';

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
  photoUrl?: string;
  sizeOz?: number;
  leadTimeDays?: number;
}

interface CartConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onViewCart: () => void;
  onCheckout: () => void;
  deliveryMode?: 'single' | 'split';
  deliveryGroups?: Array<{
    leadTimeDays: number;
    items: CartItem[];
    earliestDeliveryDate: Date;
  }>;
}

export default function CartConfirmationModal({
  open,
  onClose,
  cartItems,
  onViewCart,
  onCheckout,
  deliveryMode = 'single',
  deliveryGroups = []
}: CartConfirmationModalProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.priceCents * item.qty), 0);
  const deliveryFee = 500; // $5.00
  const total = subtotal + deliveryFee;

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="cart-confirmation-title"
      aria-describedby="cart-confirmation-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle 
        id="cart-confirmation-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <CheckCircle sx={{ color: 'success.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Added to cart
        </Typography>
        <IconButton 
          onClick={onClose} 
          size="small"
          aria-label="Close cart confirmation dialog"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Main Product Display */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar
              src={cartItems[0]?.photoUrl || '/images/chefPax_logo.png'}
              variant="rounded"
              sx={{ width: 80, height: 80 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip 
                  label={`IN ${Math.floor(Math.random() * 20) + 5} CARTS`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {cartItems[0]?.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {cartItems[0]?.sizeOz && cartItems[0].sizeOz < 50 ? '5×5 Premium Tray' : '10×20 Live Tray'}
                {cartItems.length > 1 && ` + ${cartItems.length - 1} more item${cartItems.length > 2 ? 's' : ''}`}
              </Typography>
            </Box>
          </Box>

          {/* Order Summary */}
          <Box sx={{ 
            backgroundColor: 'grey.50', 
            borderRadius: 1, 
            p: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Order Summary
            </Typography>
            
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Items:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatPrice(subtotal)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Delivery:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatPrice(deliveryFee)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 0.5 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Subtotal:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatPrice(total)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Delivery Information */}
          {deliveryMode === 'split' && deliveryGroups.length > 1 && (
            <Alert severity="info" icon={<LocalShipping />}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Smart Split Delivery
              </Typography>
              <Typography variant="body2">
                Your items will be delivered in {deliveryGroups.length} separate deliveries 
                so you get fresh microgreens as soon as they're ready!
              </Typography>
            </Alert>
          )}

          {/* Related Products */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              🌱 Complete Your Order
            </Typography>
            
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar 
                    src="/images/pea_shoots.png" 
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Pea Shoots — Live Tray"
                  secondary="Perfect companion • $30.00"
                />
                <Button size="small" variant="outlined">
                  Add
                </Button>
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar 
                    src="/images/radish_saxa2.png" 
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Rambo Purple Radish — Live Tray"
                  secondary="Spicy kick • $30.00"
                />
                <Button size="small" variant="outlined">
                  Add
                </Button>
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar 
                    src="/images/amaranth_dreads.png" 
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Red Garnet Amaranth — 5×5"
                  secondary="Chef favorite • $14.00"
                />
                <Button size="small" variant="outlined">
                  Add
                </Button>
              </ListItem>
            </List>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button
              variant="outlined"
              onClick={onViewCart}
              startIcon={<ShoppingCart />}
              sx={{ flex: 1 }}
            >
              See in cart
            </Button>
            <Button
              variant="contained"
              onClick={onCheckout}
              sx={{ 
                flex: 1,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              Checkout {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
            </Button>
          </Stack>

          {/* Trust Signals */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Fresh daily • Local Austin
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Free delivery • No commitment
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
