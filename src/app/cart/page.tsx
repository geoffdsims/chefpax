"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trackCheckout, trackSubscription } from "@/lib/analytics";
import { 
  Container, 
  TextField, 
  Typography, 
  Stack, 
  Button, 
  Divider,
  IconButton,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio
} from "@mui/material";
import { ArrowBack, Delete, ShoppingCart } from "@mui/icons-material";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import ApplePayButton from "@/components/ApplePayButton";
import AddressValidator from "@/components/AddressValidator";

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
  photoUrl?: string;
  sizeOz?: number;
  leadTimeDays?: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    address1: "",
    city: "Austin",
    state: "TX",
    zip: ""
  });
  const [isSubscription, setIsSubscription] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string>("");

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  // Load delivery options
  useEffect(() => {
    const loadDeliveryOptions = async () => {
      try {
        const response = await fetch('/api/delivery-options');
        if (response.ok) {
          const data = await response.json();
          setDeliveryOptions(data.options || []);
          // Set default to first available date
          if (data.options && data.options.length > 0) {
            setSelectedDeliveryDate(data.options[0].date);
          }
        }
      } catch (error) {
        console.error('Failed to load delivery options:', error);
      }
    };
    loadDeliveryOptions();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setCustomer(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email
      }));
    }
  }, [session]);

  const subtotal = cart.reduce((a, c) => a + c.priceCents * c.qty, 0);
  const discount = isSubscription ? subtotal * 0.1 : 0;
  const delivery = 500;
  const total = subtotal - discount + delivery;

  const removeItem = (productId: string) => {
    const updated = cart.filter(item => item.productId !== productId);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  async function checkout() {
    console.log('Checkout initiated:', { isSubscription, hasSession: !!session });
    
    // Subscription requires sign-in - but this should never happen now
    // because checkbox is only available when signed in
    if (isSubscription && !session) {
      console.log('Subscription requires sign-in (should not reach here)');
      alert('Please sign in to subscribe');
      return;
    }
    
    console.log('Proceeding with checkout (guest or authenticated)');

    // Ensure city, state, zip are populated (even if empty for now)
    const customerData = {
      ...customer,
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || ''
    };

    console.log('Checkout customer data:', customerData);

    const totalCents = total;
    trackCheckout({
      step: 'initiated',
      total_cents: totalCents,
      item_count: cart.reduce((sum, item) => sum + item.qty, 0),
    });

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        cart, 
        customer: customerData, 
        isSubscription: isSubscription && !!session,
        deliveryDate: selectedDeliveryDate
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Checkout error:', errorData);
      trackCheckout({ step: 'failed', total_cents: totalCents, item_count: cart.length });
      alert(`Checkout failed: ${errorData.error || 'Unknown error'}`);
      return;
    }

    const data = await res.json();
    if (data.url) {
      trackCheckout({ step: 'payment', total_cents: totalCents, item_count: cart.length, payment_method: 'stripe' });
      if (isSubscription) {
        trackSubscription({ type: 'started', plan: 'weekly', frequency: 'weekly', discount_percentage: 10 });
      }
      window.location.href = data.url;
    }
  }

  if (cart.length === 0) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 2 }}>
            Your cart is empty
          </Typography>
          <Button component={Link} href="/shop" variant="contained" size="large">
            Continue Shopping
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} href="/shop">
            <ArrowBack />
          </IconButton>
          <Box component="img" src="/logo.png" alt="ChefPax" sx={{ height: 32 }} />
          <Typography variant="h4" sx={{ fontFamily: 'Playfair Display' }}>
            Your Cart
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 400px' }, gap: 4, maxWidth: '1200px', mx: 'auto' }}>
          {/* Cart Items */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent>
                <List>
                  {cart.map((item, idx) => (
                    <ListItem key={item.productId} divider={idx < cart.length - 1} sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar src={item.photoUrl} variant="rounded" sx={{ width: 60, height: 60 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`Qty: ${item.qty} • ${(item.priceCents / 100).toFixed(2)} each`}
                      />
                      <Typography variant="h6" sx={{ mr: 2 }}>
                        ${((item.priceCents * item.qty) / 100).toFixed(2)}
                      </Typography>
                      <IconButton size="small" onClick={() => removeItem(item.productId)}>
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>${(subtotal / 100).toFixed(2)}</Typography>
                    </Box>
                    {isSubscription && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                        <Typography>Subscription (10%):</Typography>
                        <Typography>-${(discount / 100).toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Delivery:</Typography>
                      <Typography>${(delivery / 100).toFixed(2)}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">${(total / 100).toFixed(2)}</Typography>
                    </Box>
                  </Stack>

                  {/* Subscription Info Box */}
                  <Alert 
                    severity="success" 
                    sx={{ mt: 2 }}
                    action={
                      !session ? (
                        <Button 
                          color="inherit" 
                          size="small"
                          onClick={() => signIn('google', { callbackUrl: '/cart' })}
                        >
                          Sign In
                        </Button>
                      ) : (
                        <Checkbox 
                          checked={isSubscription} 
                          onChange={(e) => setIsSubscription(e.target.checked)}
                          sx={{ color: 'success.main' }}
                        />
                      )
                    }
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      🌱 Subscribe & Save 10%
                    </Typography>
                    <Typography variant="caption" display="block">
                      {!session 
                        ? 'Sign in to subscribe for weekly deliveries with automatic 10% discount'
                        : 'Check the box to subscribe for weekly deliveries (10% off every order)'
                      }
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Delivery Info</Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      label="Full Name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      size="small"
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      size="small"
                      fullWidth
                      required
                    />
                    <TextField
                      label="Phone"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      size="small"
                      fullWidth
                      required
                      type="tel"
                      inputProps={{ pattern: "[0-9]{10,11}" }}
                      helperText="Enter 10-digit phone number"
                    />
                    <AddressValidator
                      value={customer.address1}
                      onChange={(address) => setCustomer({ ...customer, address1: address })}
                      onValidation={(isValid, formattedAddress) => {
                        setIsAddressValid(isValid);
                        if (formattedAddress) {
                          // Parse the formatted address to extract city, state, zip
                          const parts = formattedAddress.split(',').map(p => p.trim());
                          const stateZip = parts[parts.length - 1]?.split(' ') || [];
                          const state = stateZip[0] || '';
                          const zip = stateZip[1] || '';
                          const city = parts[parts.length - 2] || '';
                          
                          setCustomer(prev => ({ 
                            ...prev, 
                            address1: formattedAddress,
                            city: city,
                            state: state,
                            zip: zip
                          }));
                        }
                      }}
                      label="Address"
                      required={true}
                    />
                    
                    {/* Delivery Date Selection */}
                    {deliveryOptions.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Choose Delivery Date
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          We deliver fresh microgreens on Tuesdays, Thursdays, and Saturdays
                        </Typography>
                        <RadioGroup
                          value={selectedDeliveryDate}
                          onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                        >
                          {deliveryOptions.map((option) => {
                            const date = new Date(option.date);
                            const isAvailable = option.available;
                            const isPastCutoff = new Date() > new Date(option.cutoffTime);
                            
                            return (
                              <FormControlLabel
                                key={option.date}
                                value={option.date}
                                control={<Radio />}
                                disabled={!isAvailable || isPastCutoff}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {date.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ({option.deliveryWindow})
                                    </Typography>
                                    {!isAvailable && (
                                      <Chip label="Full" size="small" color="error" />
                                    )}
                                    {isPastCutoff && (
                                      <Chip label="Past Cutoff" size="small" color="warning" />
                                    )}
                                  </Box>
                                }
                              />
                            );
                          })}
                        </RadioGroup>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Apple Pay Button */}
              <ApplePayButton
                cart={cart}
                customer={customer}
                total={total}
                isSubscription={isSubscription}
                onSuccess={() => {
                  // Clear cart on success
                  localStorage.setItem("cart", "[]");
                  setCart([]);
                  window.dispatchEvent(new CustomEvent("cartUpdated"));
                }}
                onError={(error) => {
                  console.error("Apple Pay error:", error);
                }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={checkout}
                disabled={!customer.name || !customer.email || !customer.phone || customer.phone.length < 10 || !customer.address1 || (customer.address1 && !isAddressValid)}
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                Proceed to Payment
              </Button>
            </Stack>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
