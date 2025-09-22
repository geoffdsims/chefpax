"use client";
import { useEffect, useState } from "react";
import { 
  Container, 
  TextField, 
  Typography, 
  Stack, 
  Button, 
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Box
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "Austin",
    state: "TX",
    zip: ""
  });

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const subtotal = cart.reduce((a, c) => a + c.priceCents * c.qty, 0);
  const delivery = 500; // $5.00
  const total = subtotal + delivery;

  async function checkout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, customer })
    });
    const { url, error } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      alert(error || "Checkout failed");
    }
  }

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
        <Toolbar>
          <IconButton component={Link} href="/shop" color="inherit">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Your Cart
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 8, maxWidth: 800 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'primary.main',
            mb: 4,
            textAlign: 'center'
          }}
        >
          Your Order
        </Typography>
        
        {/* Order Items */}
        <Box sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 3,
          mb: 4,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {cart.map((c, i) => (
            <Stack direction="row" key={i} justifyContent="space-between" mb={2}>
              <Typography variant="body1" fontWeight={500}>{c.name} × {c.qty}</Typography>
              <Typography variant="body1" fontWeight={600} color="primary.main">
                ${(c.priceCents * c.qty / 100).toFixed(2)}
              </Typography>
            </Stack>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">${(subtotal / 100).toFixed(2)}</Typography>
          </Stack>
          
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Delivery:</Typography>
            <Typography variant="body1">${(delivery / 100).toFixed(2)}</Typography>
          </Stack>
          
          <Divider sx={{ my: 2 }} />
          
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700} color="primary.main">Total:</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ${(total / 100).toFixed(2)}
            </Typography>
          </Stack>
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'primary.main',
            mb: 3,
            textAlign: 'center'
          }}
        >
          Delivery Information
        </Typography>
        
        <Box sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 4,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Stack spacing={3}>
          <TextField 
            label="Full Name" 
            value={customer.name} 
            onChange={e => setCustomer({...customer, name: e.target.value})}
            required
          />
          <TextField 
            label="Email" 
            type="email"
            value={customer.email} 
            onChange={e => setCustomer({...customer, email: e.target.value})}
            required
          />
          <TextField 
            label="Phone" 
            value={customer.phone} 
            onChange={e => setCustomer({...customer, phone: e.target.value})}
          />
          <TextField 
            label="Address 1" 
            value={customer.address1} 
            onChange={e => setCustomer({...customer, address1: e.target.value})}
            required
          />
          <TextField 
            label="Address 2" 
            value={customer.address2} 
            onChange={e => setCustomer({...customer, address2: e.target.value})}
          />
          <Stack direction="row" spacing={2}>
            <TextField 
              label="City" 
              value={customer.city} 
              onChange={e => setCustomer({...customer, city: e.target.value})} 
              sx={{ flex: 1 }}
              required
            />
            <TextField 
              label="State" 
              value={customer.state} 
              onChange={e => setCustomer({...customer, state: e.target.value})} 
              sx={{ width: 120 }}
              required
            />
            <TextField 
              label="ZIP" 
              value={customer.zip} 
              onChange={e => setCustomer({...customer, zip: e.target.value})} 
              sx={{ width: 160 }}
              required
            />
          </Stack>
          <Button 
            variant="contained" 
            size="large" 
            onClick={checkout}
            disabled={!customer.name || !customer.email || !customer.address1 || !customer.city || !customer.state || !customer.zip}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              py: 2,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(45, 80, 22, 0.3)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.26)'
              }
            }}
          >
            Proceed to Payment
          </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
