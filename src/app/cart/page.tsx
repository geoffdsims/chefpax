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
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

export default function CartPage() {
  const { data: session } = useSession();
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
  const [isSubscription, setIsSubscription] = useState(false);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string>("");
  const [deliveryOptions, setDeliveryOptions] = useState<{ date: string; message: string }[]>([]);

  useEffect(() => {
    const loadCart = () => {
      setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    };

    // Load cart on mount
    loadCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    // Load delivery options
    fetch("/api/delivery-options")
      .then(res => res.json())
      .then(data => {
        setDeliveryOptions(data);
        if (data.length > 0) {
          setSelectedDeliveryDate(data[0].date);
        }
      })
      .catch(err => console.error("Failed to load delivery options:", err));

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const subtotal = cart.reduce((a, c) => a + c.priceCents * c.qty, 0);
  const discount = isSubscription ? subtotal * 0.1 : 0; // 10% discount for subscriptions
  const delivery = 500; // $5.00
  const total = subtotal - discount + delivery;

  const handleSubscriptionChange = (checked: boolean) => {
    if (checked && !session) {
      // If user wants to subscribe but isn't signed in, prompt for authentication
      signIn();
      return;
    }
    setIsSubscription(checked);
  };

  async function checkout() {
    // If user selected subscription but isn't signed in, prompt for sign in
    if (isSubscription && !session) {
      signIn();
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        cart, 
        customer, 
        deliveryDate: selectedDeliveryDate,
        isSubscription: isSubscription && !!session // Only pass true if user is signed in
      })
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
            <Stack direction="row" key={`${c.productId}-${i}`} justifyContent="space-between" mb={2}>
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
          
          {isSubscription && (
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body1" color="success.main">Subscription Discount (10%):</Typography>
              <Typography variant="body1" color="success.main">-${(discount / 100).toFixed(2)}</Typography>
            </Stack>
          )}
          
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

        {/* Delivery Date Selection */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'primary.main',
            mb: 3,
            textAlign: 'center'
          }}
        >
          Delivery Options
        </Typography>
        
        <Box sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 4,
          mb: 4,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Choose Your Delivery Date
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select when you'd like your fresh microgreens delivered. Order anytime - no cutoff times!
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3
          }}>
            {deliveryOptions.map((option) => (
              <Card 
                key={option.date}
                sx={{ 
                  cursor: 'pointer',
                  border: selectedDeliveryDate === option.date ? 2 : 1,
                  borderColor: selectedDeliveryDate === option.date ? 'primary.main' : 'divider',
                  opacity: option.available ? 1 : 0.6
                }}
                onClick={() => option.available && setSelectedDeliveryDate(option.date)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {new Date(option.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.deliveryWindow}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Order anytime
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={option.available ? "Available" : "Full"} 
                      color={option.available ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          {selectedDeliveryDate && (
            <Alert severity="info">
              Selected delivery: {new Date(selectedDeliveryDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Alert>
          )}
        </Box>

        {/* Subscription Option */}
        <Box sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 4,
          mb: 4,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSubscription}
                onChange={(e) => handleSubscriptionChange(e.target.checked)}
                color="primary"
                disabled={!session && !isSubscription}
              />
            }
            label={
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Subscribe & Save 10%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get this order delivered weekly and save 10% on every delivery. 
                  You can pause, skip, or cancel anytime.
                </Typography>
                {!session && (
                  <Typography variant="body2" color="primary.main" sx={{ mt: 1, fontWeight: 500 }}>
                    Sign in required to create subscription
                  </Typography>
                )}
              </Box>
            }
          />
          
          {isSubscription && session && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Great choice, {session.user?.name || 'there'}!</strong> You'll save ${(discount / 100).toFixed(2)} on this order 
                and 10% on all future deliveries. Manage your subscription in your account.
              </Typography>
            </Alert>
          )}
          
          {!session && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Want to subscribe?</strong> Sign in to create your subscription and save 10% on all orders. 
                You'll also get access to your order history and subscription management.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => signIn()}
                size="small"
                sx={{ mr: 2 }}
              >
                Sign In
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setIsSubscription(false)}
                size="small"
              >
                Continue as Guest
              </Button>
            </Alert>
          )}
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
            disabled={!customer.name || !customer.email || !customer.address1 || !customer.city || !customer.state || !customer.zip || !selectedDeliveryDate}
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
