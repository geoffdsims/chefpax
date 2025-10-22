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

// Flavor profiles for intelligent pairing
interface ProductProfile {
  productId: string;
  name: string;
  price: number;
  photoUrl: string;
  description: string;
  flavorProfile: 'mild' | 'spicy' | 'sweet' | 'earthy' | 'mixed';
  pairsWith: string[]; // IDs of products that pair well
}

// Smart upsell products with flavor pairing logic
const ALL_UPSELL_PRODUCTS: ProductProfile[] = [
  {
    productId: 'pea-shoots-live-tray',
    name: 'Dun Pea Shoots — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/peas_10x20.png',
    description: 'Sweet & crunchy • Pairs with spicy',
    flavorProfile: 'sweet',
    pairsWith: ['radish-live-tray', 'broccoli-live-tray', 'wasabi-live-tray', 'basil-dark-opal']
  },
  {
    productId: 'radish-live-tray',
    name: 'Rambo Purple Radish — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/radish_rambo_10x20.png',
    description: 'Spicy kick • Pairs with mild greens',
    flavorProfile: 'spicy',
    pairsWith: ['pea-shoots-live-tray', 'sunflower-live-tray', 'broccoli-live-tray', 'amaranth-live-tray', 'basil-lemon']
  },
  {
    productId: 'amaranth-live-tray',
    name: 'Red Garnet Amaranth — 5×5',
    price: 1400,
    photoUrl: '/images/microgeens/amaranth_red_5x5.png',
    description: 'Earthy & mild • Balances spicy',
    flavorProfile: 'earthy',
    pairsWith: ['radish-live-tray', 'wasabi-live-tray', 'pea-shoots-live-tray', 'basil-thai']
  },
  {
    productId: 'broccoli-live-tray',
    name: 'Broccoli — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/brocolli_10x20.png',
    description: 'Mild & versatile • Pairs with anything',
    flavorProfile: 'mild',
    pairsWith: ['radish-live-tray', 'pea-shoots-live-tray', 'sunflower-live-tray', 'wasabi-live-tray', 'kohlrabi-purple']
  },
  {
    productId: 'sunflower-live-tray',
    name: 'Sunflower — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/subflower_10x20.png',
    description: 'Nutty & crunchy • Balances spicy',
    flavorProfile: 'mild',
    pairsWith: ['radish-live-tray', 'wasabi-live-tray', 'shiso-perilla']
  },
  {
    productId: 'wasabi-live-tray',
    name: 'Wasabi Mustard — Live Tray',
    price: 3000,
    photoUrl: '/images/microgeens/wasabi_mustard_10x20.png',
    description: 'Extra spicy • Pairs with sweet',
    flavorProfile: 'spicy',
    pairsWith: ['pea-shoots-live-tray', 'sunflower-live-tray', 'amaranth-live-tray', 'basil-lemon']
  },
  // Premium Specialty Options
  {
    productId: 'basil-dark-opal',
    name: 'Dark Opal Basil — 5×5 Premium',
    price: 1800,
    photoUrl: '/images/microgeens/basil_dark_opal_5x5.png',
    description: 'Purple color • Sweet basil flavor',
    flavorProfile: 'sweet',
    pairsWith: ['radish-live-tray', 'amaranth-live-tray', 'pea-shoots-live-tray']
  },
  {
    productId: 'basil-lemon',
    name: 'Lemon Basil — 5×5 Premium',
    price: 1800,
    photoUrl: '/images/microgeens/basil_lemon_5x5.png',
    description: 'Citrus notes • Bright & aromatic',
    flavorProfile: 'sweet',
    pairsWith: ['radish-live-tray', 'wasabi-live-tray', 'sunflower-live-tray']
  },
  {
    productId: 'basil-thai',
    name: 'Thai Basil — 5×5 Premium',
    price: 1800,
    photoUrl: '/images/microgeens/basil_thai_5x5.png',
    description: 'Anise flavor • Exotic & bold',
    flavorProfile: 'sweet',
    pairsWith: ['radish-live-tray', 'amaranth-live-tray', 'broccoli-live-tray']
  },
  {
    productId: 'kohlrabi-purple',
    name: 'Purple Vienna Kohlrabi — 10×20',
    price: 3500,
    photoUrl: '/images/microgeens/kohlrabi_purple_vienna_10x20.png',
    description: 'Vibrant purple • Mild & crunchy',
    flavorProfile: 'mild',
    pairsWith: ['radish-live-tray', 'wasabi-live-tray', 'amaranth-live-tray']
  },
  {
    productId: 'shiso-perilla',
    name: 'Shiso Perilla — Premium',
    price: 2500,
    photoUrl: '/images/microgeens/shiso_perilla.png',
    description: 'Unique flavor • Asian cuisine',
    flavorProfile: 'earthy',
    pairsWith: ['sunflower-live-tray', 'pea-shoots-live-tray', 'radish-live-tray']
  },
  {
    productId: 'super-mix-live-tray',
    name: 'ChefPax Superfood Mix — Live Tray',
    price: 3500,
    photoUrl: '/images/microgeens/super_mix_.png',
    description: 'Best seller • Complete variety',
    flavorProfile: 'mixed',
    pairsWith: [] // Mix goes with everything, so don't specifically pair
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
  const [currentCart, setCurrentCart] = useState<CartItem[]>(cartItems);
  const [popularityCount] = useState(Math.floor(Math.random() * 20) + 5);

  // Update cart when it changes
  useEffect(() => {
    setCurrentCart(cartItems);
  }, [cartItems]);

  // Smart upsell logic: suggest products that pair well with cart items
  useEffect(() => {
    const cartProductIds = new Set(currentCart.map(item => item.productId));
    
    // Get pairing suggestions for items in cart
    const pairingSuggestions = new Set<string>();
    currentCart.forEach(item => {
      const product = ALL_UPSELL_PRODUCTS.find(p => p.productId === item.productId);
      if (product && product.pairsWith.length > 0) {
        product.pairsWith.forEach(pairing => pairingSuggestions.add(pairing));
      }
    });
    
    // Filter out products already in cart or already added
    const pairedProducts = ALL_UPSELL_PRODUCTS.filter(
      product => pairingSuggestions.has(product.productId) && 
                 !cartProductIds.has(product.productId) && 
                 !addedUpsells.has(product.productId)
    );
    
    // If we have paired suggestions, use those; otherwise show general options
    if (pairedProducts.length > 0) {
      setUpsellProducts(pairedProducts.slice(0, 2));
    } else {
      // Fallback: show any products not in cart
      const available = ALL_UPSELL_PRODUCTS.filter(
        product => !cartProductIds.has(product.productId) && !addedUpsells.has(product.productId)
      );
      setUpsellProducts(available.slice(0, 2));
    }
  }, [currentCart, addedUpsells]);

  const subtotal = currentCart.reduce((sum, item) => sum + (item.priceCents * item.qty), 0);
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
      // Add to current cart state immediately
      setCurrentCart(prev => [...prev, {
        productId: product.productId,
        name: product.name,
        priceCents: product.price,
        qty: 1,
        photoUrl: product.photoUrl
      }]);
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
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          maxHeight: '90vh',
          margin: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: '100%', sm: 'md' }
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

      <DialogContent sx={{ p: 2, maxHeight: '75vh', overflowY: 'auto' }}>
        <Stack spacing={2}>
          {/* Main Product Display - Compact */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar
              src={currentCart[0]?.photoUrl || '/images/microgeens/chefPax_mix.png'}
              variant="rounded"
              sx={{ width: 60, height: 60 }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, lineHeight: 1.2 }}>
                {currentCart[0]?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {currentCart[0]?.sizeOz && currentCart[0].sizeOz < 50 ? '5×5 Tray' : '10×20 Tray'}
                {currentCart.length > 1 && ` +${currentCart.length - 1} more`}
              </Typography>
            </Box>
            <Chip 
              label={`${popularityCount} carts`}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>

          {/* Order Summary - Compact */}
          <Box sx={{ 
            backgroundColor: 'grey.50', 
            borderRadius: 1, 
            p: 1.5,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Items:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {formatPrice(subtotal)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Delivery:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {formatPrice(deliveryFee)}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Total:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatPrice(total)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Login/Rewards Prompt - Compact */}
          {!isLoggedIn && (
            <Alert 
              severity="success" 
              icon={false}
              sx={{ py: 1, px: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
                  🎁 Sign up for rewards & exclusive discounts
                </Typography>
                <Button 
                  size="small" 
                  variant="contained" 
                  sx={{ fontSize: '0.7rem', py: 0.5, px: 1.5 }}
                  href="/api/auth/signin"
                >
                  Join
                </Button>
              </Box>
            </Alert>
          )}

          {/* Upsell Products - Compact Grid */}
          {upsellProducts.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                🌱 Pairs well with:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {upsellProducts.slice(0, 2).map((product) => (
                  <Box 
                    key={product.productId} 
                    sx={{ 
                      flex: '1 1 calc(50% - 4px)',
                      minWidth: 140,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                      <Avatar 
                        src={product.photoUrl} 
                        variant="rounded"
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }}>
                          {product.name.split('—')[0].trim()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                          {formatPrice(product.price)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      size="small" 
                      variant="outlined"
                      fullWidth
                      onClick={() => handleAddUpsell(product)}
                      sx={{ py: 0.25, fontSize: '0.7rem' }}
                    >
                      Add
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Action Buttons - Compact */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={onViewCart}
              startIcon={<ShoppingCart />}
              sx={{ flex: 1, py: 1, fontSize: '0.875rem' }}
            >
              Cart
            </Button>
            <Button
              variant="contained"
              onClick={onCheckout}
              sx={{ flex: 1, py: 1, fontSize: '0.875rem' }}
            >
              Checkout ({currentCart.length})
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
