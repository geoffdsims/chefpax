"use client";
import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  Add as AddIcon
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

interface UpsellProduct {
  productId: string;
  name: string;
  price: number;
  photoUrl: string;
  description: string;
}

interface CartConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onViewCart: () => void;
  onCheckout: () => void;
  onAddUpsell?: (product: UpsellProduct) => void;
  deliveryMode?: 'single' | 'split';
  deliveryGroups?: Array<{
    leadTimeDays: number;
    items: CartItem[];
    earliestDeliveryDate: Date;
  }>;
}

// Smart upsell products - complements what's in cart
const ALL_UPSELL_PRODUCTS: UpsellProduct[] = [
  {
    productId: 'pea-shoots-live-tray',
    name: 'Dun Pea Shoots — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/peas_10x20.png',
    description: 'Perfect companion • Sweet & crunchy'
  },
  {
    productId: 'radish-live-tray',
    name: 'Rambo Purple Radish — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/radish_rambo_10x20.png',
    description: 'Spicy kick • Colorful garnish'
  },
  {
    productId: 'amaranth-live-tray',
    name: 'Red Garnet Amaranth — 5×5',
    price: 1400,
    photoUrl: '/images/microgeens/amaranth_red_5x5.png',
    description: 'Chef favorite • Nutrient-dense'
  },
  {
    productId: 'broccoli-live-tray',
    name: 'Broccoli — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/brocolli_10x20.png',
    description: 'Mild & versatile • Health boost'
  },
  {
    productId: 'super-mix-live-tray',
    name: 'ChefPax Superfood Mix — Live Tray',
    price: 3500,
    photoUrl: '/images/microgeens/super_mix_.png',
    description: 'Best seller • Complete variety'
  }
];

export default function CartConfirmationModal({
  open,
  onClose,
  cartItems,
  onViewCart,
  onCheckout,
  onAddUpsell,
  deliveryMode = 'single',
  deliveryGroups = []
}: CartConfirmationModalProps) {
  const [addedUpsells, setAddedUpsells] = useState<Set<string>>(new Set());
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);

  // Smart upsell logic: exclude products already in cart
  useEffect(() => {
    const cartProductIds = new Set(cartItems.map(item => item.productId));
    const available = ALL_UPSELL_PRODUCTS.filter(
      product => !cartProductIds.has(product.productId) && !addedUpsells.has(product.productId)
    );
    // Show max 3 upsells
    setUpsellProducts(available.slice(0, 3));
  }, [cartItems, addedUpsells]);

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

  const handleAddUpsell = (product: UpsellProduct) => {
    if (onAddUpsell) {
      onAddUpsell(product);
      setAddedUpsells(prev => new Set([...prev, product.productId]));
    }
  };

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('session') !== null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={false}
      aria-labelledby="cart-confirmation-title"
      aria-describedby="cart-confirmation-description"
      disableEscapeKeyDown={false}
      PaperProps={{
        sx={{
          borderRadius: { xs: 0, sm: 2 },
          maxHeight: '90vh',
          margin: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: '100%', sm: 'md' },
          '@media (max-width: 600px)': {
            margin: 0,
            borderRadius: 0,
            maxHeight: '100vh',
          }
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
              src={cartItems[0]?.photoUrl || '/images/microgeens/chefPax_mix.png'}
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

          {/* Login/Rewards Prompt (only if not logged in) */}
          {!isLoggedIn && (
            <Alert 
              severity="success" 
              sx={{ 
                backgroundColor: 'success.light',
                '& .MuiAlert-icon': { color: 'success.dark' }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                🎁 Earn Rewards & Save!
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Sign up or log in to earn points on every purchase, get exclusive discounts, and track your orders.
              </Typography>
              <Button 
                size="small" 
                variant="contained" 
                sx={{ 
                  backgroundColor: 'success.dark',
                  '&:hover': { backgroundColor: 'success.main' }
                }}
                href="/api/auth/signin"
              >
                Sign Up / Log In
              </Button>
            </Alert>
          )}

          {/* Upsell Products - Smart Suggestions */}
          {upsellProducts.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                🌱 Complete Your Order
              </Typography>
              
              <List dense>
                {upsellProducts.map((product) => (
                  <ListItem key={product.productId} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar 
                        src={product.photoUrl} 
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.description} • ${formatPrice(product.price)}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddUpsell(product)}
                      sx={{ minWidth: 80 }}
                    >
                      Add
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1.5, sm: 2 }} 
            sx={{ pt: 1 }}
          >
            <Button
              variant="outlined"
              onClick={onViewCart}
              startIcon={<ShoppingCart />}
              sx={{ 
                flex: 1,
                minHeight: { xs: 48, sm: 36 },
                fontSize: { xs: '1rem', sm: '0.875rem' }
              }}
            >
              See in cart
            </Button>
            <Button
              variant="contained"
              onClick={onCheckout}
              sx={{ 
                flex: 1,
                minHeight: { xs: 48, sm: 36 },
                fontSize: { xs: '1rem', sm: '0.875rem' },
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
            borderColor: 'divider',
            flexWrap: 'wrap'
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
