"use client";
import { useState, useEffect } from "react";
import { 
  Drawer, 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Divider,
  Stack
} from "@mui/material";
import { ShoppingCart, Close } from "@mui/icons-material";
import Link from "next/link";

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item => 
      item.productId === productId ? { ...item, qty: newQty } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.priceCents * item.qty), 0);
  const deliveryFee = 500; // $5.00
  const total = subtotal + deliveryFee;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ 
        '& .MuiDrawer-paper': { 
          width: 420, 
          p: 3,
          backgroundColor: 'background.paper',
          borderLeft: '1px solid rgba(0,0,0,0.05)'
        } 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
          Cart ({cart.length} items)
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {cart.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Your cart is empty
        </Typography>
      ) : (
        <>
          <List>
            {cart.map((item) => (
              <ListItem key={item.productId} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.name}
                  secondary={`$${(item.priceCents/100).toFixed(2)} each`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => updateQuantity(item.productId, item.qty - 1)}
                  >
                    -
                  </Button>
                  <Typography>{item.qty}</Typography>
                  <Button 
                    size="small" 
                    onClick={() => updateQuantity(item.productId, item.qty + 1)}
                  >
                    +
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Subtotal:</Typography>
              <Typography>${(subtotal/100).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Delivery:</Typography>
              <Typography>${(deliveryFee/100).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${(total/100).toFixed(2)}</Typography>
            </Box>
          </Stack>

          <Button 
            component={Link} 
            href="/cart" 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={onClose}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(45, 80, 22, 0.3)'
              }
            }}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </Drawer>
  );
}
