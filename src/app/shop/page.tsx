"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { 
  Container, 
  Box, 
  Snackbar, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { 
  ShoppingCart, 
  CalendarToday, 
  Repeat, 
  TrendingUp,
  AccountCircle,
  Person,
  Settings,
  History,
  Loyalty,
  Notifications,
  ExitToApp
} from "@mui/icons-material";
import { useSession, signIn, signOut } from "next-auth/react";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";

interface Product {
  _id: string;
  sku: string;
  name: string;
  priceCents: number;
  unit: string;
  photoUrl?: string;
  category?: "mix" | "single" | "live_tray";
  variety?: "pea" | "sunflower" | "radish" | "amaranth" | "mixed";
  sizeOz?: number;
  weeklyCapacity?: number;
  currentWeekAvailable?: number;
  active?: boolean;
  sort?: number;
}

interface DeliveryOption {
  date: string;
  available: boolean;
  cutoffTime: string;
  deliveryWindow: string;
  capacityUsed: number;
  maxCapacity: number;
  currentOrders: number;
}

interface InventoryForecast {
  week: string;
  deliveryDate: string;
  available: {
    [sku: string]: {
      available: number;
      reserved: number;
      total: number;
    };
  };
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Shop() {
  const { data } = useSWR("/api/products", fetcher);
  const { data: deliveryOptions } = useSWR("/api/delivery-options", fetcher);
  const [notice, setNotice] = useState<string | undefined>();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [inventoryForecast, setInventoryForecast] = useState<InventoryForecast | null>(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const { data: session } = useSession();

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

    const products = React.useMemo(() => {
      // Fallback products if API fails - Live trays only for Texas cottage exemption compliance
      const fallbackProducts: Product[] = [
        { _id: "fallback-1", sku: "CHEFPAX_MIX_LIVE_TRAY", name: "ChefPax Mix Live Tray (10×20)", priceCents: 3500, unit: "tray", active: true, sort: 1, category: "live_tray", variety: "mixed", sizeOz: 200 },
        { _id: "fallback-2", sku: "PEA_LIVE_TRAY", name: "Live Tray — Pea Shoots (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 2, category: "live_tray", variety: "pea", sizeOz: 200 },
        { _id: "fallback-3", sku: "RADISH_LIVE_TRAY", name: "Live Tray — Radish (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 3, category: "live_tray", variety: "radish", sizeOz: 200 },
        { _id: "fallback-4", sku: "SUNFLOWER_LIVE_TRAY", name: "Live Tray — Sunflower (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 4, category: "live_tray", variety: "sunflower", sizeOz: 200 },
        { _id: "fallback-5", sku: "AMARANTH_LIVE_TRAY", name: "Live Tray — Amaranth (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 5, category: "live_tray", variety: "amaranth", sizeOz: 200 },
        { _id: "fallback-6", sku: "CHEFPAX_PREMIUM_MIX_LIVE_TRAY", name: "Premium ChefPax Mix Live Tray (10×20)", priceCents: 5000, unit: "tray", active: true, sort: 6, category: "premium_live_tray", variety: "mixed", sizeOz: 200 },
        { _id: "fallback-7", sku: "PEA_PREMIUM_LIVE_TRAY", name: "Premium Live Tray — Pea Shoots (10×20)", priceCents: 4500, unit: "tray", active: true, sort: 7, category: "premium_live_tray", variety: "pea", sizeOz: 200 },
        { _id: "fallback-8", sku: "RADISH_PREMIUM_LIVE_TRAY", name: "Premium Live Tray — Radish (10×20)", priceCents: 4500, unit: "tray", active: true, sort: 8, category: "premium_live_tray", variety: "radish", sizeOz: 200 },
      ];
      
      return data && Array.isArray(data) ? data : fallbackProducts;
    }, [data]);

  // Load inventory forecast for next delivery date
  React.useEffect(() => {
    fetch("/api/delivery-options")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          fetch(`/api/delivery-options?deliveryDate=${data[0].date}`)
            .then(res => res.json())
            .then(forecast => setInventoryForecast(forecast))
            .catch(err => console.error("Failed to load inventory forecast:", err));
        }
      })
      .catch(err => console.error("Failed to load delivery options:", err));
  }, []);

  function addToCart(p: Product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item.productId === p._id);
    
    if (existingItemIndex >= 0) {
      // If item exists, increment quantity
      cart[existingItemIndex].qty += 1;
    } else {
      // If item doesn't exist, add new item
      cart.push({ 
        productId: p._id, 
        name: p.name, 
        priceCents: p.priceCents, 
        qty: 1,
        deliveryDate: deliveryOptions?.[0]?.date
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    setNotice(`${p.name} added to cart`);
  }

  function formatDeliveryDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function getAvailabilityStatus(product: Product): { status: "sold_out" | "low_stock" | "in_stock"; message: string } | null {
    if (!inventoryForecast) return null;
    
    const sku = product.sku;
    const forecast = inventoryForecast.available[sku];
    
    if (!forecast) return null;
    
    if (forecast.available === 0) {
      return { status: "sold_out", message: "Sold out for this delivery" };
    } else if (forecast.available <= 3) {
      return { status: "low_stock", message: `Only ${forecast.available} left` };
    } else {
      return { status: "in_stock", message: `${forecast.available} available` };
    }
  }

  return (
    <>
      {/* Modern Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)",
          color: "white",
          py: 2,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography 
              variant="h5" 
              component={Link} 
              href="/" 
              sx={{ 
                fontWeight: 600,
                textDecoration: 'none',
                color: 'white',
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              ChefPax
            </Typography>
            
            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              {/* Auth buttons */}
              {session ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button 
                    onClick={handleAccountMenuOpen}
                    variant="text" 
                    size="small" 
                    startIcon={<AccountCircle />}
                    sx={{ color: "white" }}
                  >
                    Account
                  </Button>
                  <Menu
                    anchorEl={accountMenuAnchor}
                    open={Boolean(accountMenuAnchor)}
                    onClose={handleAccountMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        borderRadius: 2,
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem component={Link} href="/account" onClick={handleAccountMenuClose}>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} href="/orders" onClick={handleAccountMenuClose}>
                      <ListItemIcon>
                        <History fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Order History</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} href="/subscriptions" onClick={handleAccountMenuClose}>
                      <ListItemIcon>
                        <Repeat fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Subscriptions</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} href="/loyalty" onClick={handleAccountMenuClose}>
                      <ListItemIcon>
                        <Loyalty fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Loyalty Points</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} href="/notifications" onClick={handleAccountMenuClose}>
                      <ListItemIcon>
                        <Notifications fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Notifications</ListItemText>
                    </MenuItem>
                    <MenuItem component={Link} href="/settings" onClick={handleAccountMenuClose}>
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Settings</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { signOut(); handleAccountMenuClose(); }}>
                      <ListItemIcon>
                        <ExitToApp fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sign Out</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button onClick={() => signIn()} variant="text" size="small" sx={{ color: "white" }}>
                  Sign In
                </Button>
              )}
              
              <IconButton onClick={() => setCartOpen(true)} sx={{ color: 'white' }}>
                <ShoppingCart />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
          color: "white",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600, 
                mb: 2,
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              Live Microgreen Trays
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9,
                maxWidth: "600px",
                mx: "auto",
                mb: 4,
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              Elevate your culinary brand with fresh, live microgreen trays delivered to your kitchen
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 3 }}>
        {/* Tabs Section */}
        <Box sx={{ mb: 3 }}>
          
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                borderRadius: "999px",
                p: 0.5,
                display: "flex",
                gap: 0.5,
              }}
            >
              <Button
                onClick={() => setSelectedTab(0)}
                variant={selectedTab === 0 ? "contained" : "text"}
                sx={{
                  borderRadius: "999px",
                  px: 4,
                  py: 1.5,
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 600,
                  ...(selectedTab === 0 && {
                    backgroundColor: "#4CAF50",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                  }),
                  ...(selectedTab !== 0 && {
                    color: "#666",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  })
                }}
              >
                <CalendarToday sx={{ mr: 1 }} />
                Shop Now
              </Button>
              <Button
                onClick={() => setSelectedTab(1)}
                variant={selectedTab === 1 ? "contained" : "text"}
                sx={{
                  borderRadius: "999px",
                  px: 4,
                  py: 1.5,
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 600,
                  ...(selectedTab === 1 && {
                    backgroundColor: "#4CAF50",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                  }),
                  ...(selectedTab !== 1 && {
                    color: "#666",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                    }
                  })
                }}
              >
                <Repeat sx={{ mr: 1 }} />
                Subscriptions
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Delivery Info Banner */}
        {selectedTab === 0 && (
          <Box
            sx={{
              background: "linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)",
              borderRadius: 3,
              p: 3,
              mb: 4,
              border: "1px solid rgba(76, 175, 80, 0.2)",
            }}
          >
            <Typography variant="body1" sx={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              color: "#2E7D32",
              fontWeight: 500,
              textAlign: "center",
            }}>
              <strong>Elevate your culinary brand!</strong> Order anytime and choose your preferred delivery date. 
              Live microgreen trays delivered to help you create Instagram-worthy dishes and grow your reputation.
            </Typography>
          </Box>
        )}

        {/* Products Grid */}
        {selectedTab === 0 && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 4,
            mb: 8
          }}>
            {products?.map((p: Product, index: number) => {
              const availability = getAvailabilityStatus(p);
              return (
                <Box key={`${p.sku}-${p._id || index}`}>
                  <ProductCard p={p} onAdd={addToCart} availability={availability} />
                </Box>
              );
            })}
          </Box>
        )}

        {/* Subscription Tab Content */}
        {selectedTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Weekly Subscription Plans
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                Get live microgreen trays delivered weekly with our subscription service. 
                Save 10% on all orders and never run out of your favorites.
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  Subscription Benefits:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    10% discount on all orders
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    Automatic delivery scheduling
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    Pause, resume, or cancel anytime
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}>
                    Priority customer support
                  </Typography>
                </Box>
                
                {session ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      <Typography sx={{
                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}>
                        Welcome back, {session.user?.name}! Your subscription management panel is ready.
                      </Typography>
                    </Alert>
                    
                    <Button 
                      variant="contained" 
                      onClick={() => window.location.href = '/account'}
                      sx={{ mt: 2 }}
                    >
                      Manage Subscriptions
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography sx={{
                      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    }}>
                      Sign in to create and manage your subscriptions. You can also continue as a guest for one-time orders.
                    </Typography>
                  </Alert>
                )}
                
                <Button 
                  variant="outlined" 
                  onClick={() => setSelectedTab(0)}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Continue as Guest (One-Time Orders)
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}


        {/* Delivery Information */}
        <Box sx={{ 
          backgroundColor: '#FAFAFA',
          borderRadius: 2,
          p: 4,
          border: '1px solid #E0E0E0',
          mt: 4
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 600,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            Flexible Delivery Options
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            • Order anytime and schedule your preferred delivery date<br/>
            • Multiple delivery windows available each week<br/>
            • Austin area delivery • $5 delivery fee<br/>
            • Live trays provide 6-10 harvests each • Cut fresh as needed
          </Typography>
        </Box>

        <Snackbar 
          open={!!notice} 
          autoHideDuration={3000} 
          onClose={() => setNotice(undefined)} 
          message={notice}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
