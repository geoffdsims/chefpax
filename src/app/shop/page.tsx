"use client";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { trackCart, trackPremiumPricing } from "@/lib/analytics";
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
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  Badge
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
import CartConfirmationModal from "@/components/CartConfirmationModal";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import PushNotificationManager from "@/components/PushNotificationManager";

interface Product {
  leadTimeDays: any;
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
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountTab, setAccountTab] = useState(0);
  const [rotatingTextIndex, setRotatingTextIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showCartConfirmation, setShowCartConfirmation] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [currentCartItems, setCurrentCartItems] = useState<any[]>([]);
  const { data: session } = useSession();

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load cart count from localStorage and listen for cart updates
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      // Calculate total quantity of all items, not just unique items
      const totalQuantity = cart.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
      setCartCount(totalQuantity);
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates from CartDrawer
    window.addEventListener("cartUpdated", updateCartCount);

    // Cleanup
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Rotating text sentences
  const rotatingTexts = [
    "Fresh microgreen trays delivered to elevate your culinary brand",
    "Order anytime! Choose your delivery date. Create Instagram-worthy dishes with live microgreen trays."
  ];

  // Rotate text every 4 seconds with smooth transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setRotatingTextIndex((prevIndex) => (prevIndex + 1) % rotatingTexts.length);
        setIsTransitioning(false);
      }, 250); // Half of transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleAccountModalOpen = () => {
    setAccountModalOpen(true);
    setAccountMenuAnchor(null);
  };

  const handleAccountModalClose = () => {
    setAccountModalOpen(false);
  };

    const products = React.useMemo(() => {
      // Fallback products if API fails - Live trays only for Texas cottage exemption compliance
      const fallbackProducts: Product[] = [
        { _id: "fallback-1", sku: "CHEFPAX_MIX_LIVE_TRAY", name: "ChefPax Mix Live Tray (10×20)", priceCents: 3500, unit: "tray", active: true, sort: 1, category: "live_tray", variety: "mixed", sizeOz: 200 },
        { _id: "fallback-2", sku: "PEA_LIVE_TRAY", name: "Live Tray — Pea Shoots (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 2, category: "live_tray", variety: "pea", sizeOz: 200 },
        { _id: "fallback-3", sku: "RADISH_LIVE_TRAY", name: "Live Tray — Radish (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 3, category: "live_tray", variety: "radish", sizeOz: 200 },
        { _id: "fallback-4", sku: "SUNFLOWER_LIVE_TRAY", name: "Live Tray — Sunflower (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 4, category: "live_tray", variety: "sunflower", sizeOz: 200 },
        { _id: "fallback-5", sku: "AMARANTH_LIVE_TRAY", name: "Live Tray — Amaranth (10×20)", priceCents: 3000, unit: "tray", active: true, sort: 5, category: "live_tray", variety: "amaranth", sizeOz: 200 },
        { _id: "fallback-6", sku: "CHEFPAX_PREMIUM_MIX_LIVE_TRAY", name: "Premium ChefPax Mix Live Tray (10×20)", priceCents: 5000, unit: "tray", active: true, sort: 6, category: "live_tray", variety: "mixed", sizeOz: 200 },
        { _id: "fallback-7", sku: "PEA_PREMIUM_LIVE_TRAY", name: "Premium Live Tray — Pea Shoots (10×20)", priceCents: 4500, unit: "tray", active: true, sort: 7, category: "live_tray", variety: "pea", sizeOz: 200 },
        { _id: "fallback-8", sku: "RADISH_PREMIUM_LIVE_TRAY", name: "Premium Live Tray — Radish (10×20)", priceCents: 4500, unit: "tray", active: true, sort: 8, category: "live_tray", variety: "radish", sizeOz: 200 },
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
        photoUrl: p.photoUrl,
        sizeOz: p.sizeOz,
        leadTimeDays: p.leadTimeDays,
        deliveryDate: deliveryOptions?.[0]?.date
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Track cart addition
    trackCart({
      action: 'add',
      product: p.name,
      quantity: 1,
      price_cents: p.priceCents,
    });
    
    // Track premium pricing acceptance (products > $30)
    if (p.priceCents > 3000) {
      trackPremiumPricing({
        product: p.name,
        price_cents: p.priceCents,
        competitor_price_cents: Math.round(p.priceCents / 1.4), // Estimate 40% premium
        premium_percentage: 40,
        accepted: true,
      });
    }
    // Calculate total quantity of all items, not just unique items
    const totalQuantity = cart.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
    setCartCount(totalQuantity);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    
    setNotice(`${p.name} added to cart`);
  }

  function handleShowCartConfirmation(product: Product) {
    setLastAddedProduct(product);
    // Load current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCurrentCartItems(cart);
    setShowCartConfirmation(true);
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
    // First try to use product's own currentWeekAvailable
    const available = product.currentWeekAvailable ?? product.weeklyCapacity ?? 0;
    
    if (available === 0) {
      return { status: "sold_out", message: "Sold out for this delivery" };
    } else if (available <= 3) {
      return { status: "low_stock", message: `Only ${available} left` };
    } else {
      return { status: "in_stock", message: `${available} available` };
    }
    
    // Fallback to inventory forecast if available
    if (inventoryForecast) {
      const sku = product.sku;
      const forecast = inventoryForecast.available[sku];
      
      if (forecast) {
        if (forecast.available === 0) {
          return { status: "sold_out", message: "Sold out for this delivery" };
        } else if (forecast.available <= 3) {
          return { status: "low_stock", message: `Only ${forecast.available} left` };
        } else {
          return { status: "in_stock", message: `${forecast.available} available` };
        }
      }
    }
    
    return { status: "in_stock", message: "In stock" };
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
                    startIcon={
                      session?.user?.image ? (
                        <Avatar 
                          src={session.user.image} 
                          sx={{ width: 20, height: 20 }}
                        />
                      ) : (
                        <AccountCircle />
                      )
                    }
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
                    <MenuItem onClick={() => { setAccountTab(0); handleAccountModalOpen(); }}>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setAccountTab(1); handleAccountModalOpen(); }}>
                      <ListItemIcon>
                        <History fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Order History</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setAccountTab(2); handleAccountModalOpen(); }}>
                      <ListItemIcon>
                        <Repeat fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Subscriptions</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setAccountTab(3); handleAccountModalOpen(); }}>
                      <ListItemIcon>
                        <Loyalty fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Loyalty Points</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setAccountTab(0); handleAccountModalOpen(); }}>
                      <ListItemIcon>
                        <Notifications fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Notifications</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setAccountTab(0); handleAccountModalOpen(); }}>
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
              
              <IconButton 
                onClick={() => setCartOpen(true)} 
                sx={{ 
                  color: 'white',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Badge 
                  badgeContent={cartCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ff4444',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      minWidth: '20px',
                      height: '20px',
                      border: '2px solid white',
                    }
                  }}
                >
                  <ShoppingCart sx={{ fontSize: '1.5rem' }} />
                </Badge>
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>


      <Container sx={{ py: 3 }}>

        {/* Main Banner */}
        {selectedTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              elevation={1}
              sx={{
                textAlign: "center",
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 4 }}>
              <div>
                <Typography 
                  variant="h3" 
                  sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    color: "#2D5016",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                  }}
                >
                  Live Microgreen Trays
                </Typography>
              </div>
              
              <div>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    color: "#2E7D32",
                    fontWeight: 400,
                    minHeight: "72px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isTransitioning ? 0 : 1,
                    transition: "opacity 0.5s ease-in-out",
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    lineHeight: 1.4,
                  }}
                >
                  {rotatingTexts[rotatingTextIndex]}
                </Typography>
              </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Products Grid */}
        {selectedTab === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 4,
              mb: 8
            }}>
              {products?.map((p: Product, index: number) => {
                const availability = getAvailabilityStatus(p);
                return (
                  <motion.div 
                    key={`${p.sku}-${p._id || index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <ProductCard 
                      p={p} 
                      onAdd={addToCart} 
                      availability={availability}
                      onShowCartConfirmation={handleShowCartConfirmation}
                    />
                  </motion.div>
                );
              })}
            </Box>
          </motion.div>
        )}

        {/* Subscription Tab Content */}
        {selectedTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              elevation={1}
              className={isMounted ? "shimmer-container" : ""}
              sx={{
                textAlign: "center",
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 4 }}>
              <div>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    color: "#2D5016",
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Weekly Subscription Plans
                </Typography>
              </div>
              
              <div>
                <Typography 
                  variant="h6" 
                  color="#2E7D32" 
                  paragraph 
                  sx={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 400,
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  Get live microgreen trays delivered weekly with our subscription service. 
                  Save 10% on all orders and never run out of your favorites.
                </Typography>
              </div>
              
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
          </motion.div>
        )}


        {/* Delivery Information */}
        <div>
          <Box sx={{ 
            background: "linear-gradient(135deg, rgba(45, 80, 22, 0.02) 0%, rgba(76, 175, 80, 0.02) 100%)",
            borderRadius: 4,
            p: 4,
            border: "1px solid rgba(45, 80, 22, 0.1)",
            mt: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #2D5016 0%, #4CAF50 50%, #2D5016 100%)",
            }
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 700,
              color: "#2D5016",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              mb: 3,
            }}>
              Flexible Delivery Options
            </Typography>
            <Typography variant="h6" color="#2E7D32" paragraph sx={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 400,
              lineHeight: 1.8,
            }}>
              • Order anytime and schedule your preferred delivery date<br/>
              • Multiple delivery windows available each week<br/>
              • Austin area delivery • $5 delivery fee<br/>
              • Live trays provide 6-10 harvests each • Cut fresh as needed
            </Typography>
          </Box>
        </div>

        <Snackbar 
          open={!!notice} 
          autoHideDuration={3000} 
          onClose={() => setNotice(undefined)} 
          message={notice}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Account Modal */}
      <Dialog 
        open={accountModalOpen} 
        onClose={handleAccountModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            minHeight: '60vh'
          }
        }}
        TransitionProps={{
          timeout: { enter: 300, exit: 200 }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={session?.user?.image || undefined}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                width: 48,
                height: 48
              }}
            >
              {!session?.user?.image && <Person />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Account
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Signed in as {session?.user?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={accountTab} 
            onChange={(_, newValue) => setAccountTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid #f0f0f0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48
              }
            }}
          >
            <Tab 
              icon={<Person />} 
              label="Profile" 
              iconPosition="start"
            />
            <Tab 
              icon={<History />} 
              label="Orders" 
              iconPosition="start"
            />
            <Tab 
              icon={<Repeat />} 
              label="Subscriptions" 
              iconPosition="start"
            />
            <Tab 
              icon={<Loyalty />} 
              label="Loyalty" 
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 3, minHeight: 400 }}>
            {accountTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar 
                    src={session?.user?.image || undefined}
                    sx={{ width: 64, height: 64, bgcolor: '#4CAF50' }}
                  >
                    {!session?.user?.image && <Person fontSize="large" />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{session?.user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {session?.user?.email}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage your personal information, delivery preferences, and account settings.
                </Typography>
              </Box>
            )}

            {accountTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Order History
                </Typography>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  backgroundColor: '#fafafa',
                  borderRadius: 2,
                  border: '2px dashed #e0e0e0'
                }}>
                  <History sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No orders yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your order history will appear here once you place your first order.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => { setSelectedTab(0); handleAccountModalClose(); }}
                    sx={{
                      background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
                      },
                    }}
                  >
                    Start Shopping
                  </Button>
                </Box>
              </Box>
            )}

            {accountTab === 2 && (
              <Box>
                {session ? (
                  <Box>
                    {/* Active Subscriptions */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        py: 2,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          No active subscriptions
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Subscribe to products to see them here
                        </Typography>
                      </Box>
                    </Box>

                    {/* Subscription Info */}
                    <Box sx={{ 
                      p: 3,
                      backgroundColor: '#f1f8e9',
                      borderRadius: 2,
                      border: '1px solid #4CAF50'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2D5016' }}>
                        Weekly Subscription Plans
                      </Typography>
                      <Typography variant="body2" color="#2E7D32" sx={{ mb: 2 }}>
                        Get live microgreen trays delivered weekly with our subscription service. 
                        Save 10% on all orders and never run out of your favorites.
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Subscription Benefits:
                      </Typography>
                      <Typography component="div" variant="body2" color="text.secondary">
                        • 10% discount on all orders<br/>
                        • Automatic delivery scheduling<br/>
                        • Pause, resume, or cancel anytime<br/>
                        • Priority customer support
                      </Typography>
                      
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: '0.875rem' }}>
                          Welcome back, {session.user?.name}! Your subscription management panel is ready.
                        </Typography>
                      </Alert>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    backgroundColor: '#fafafa',
                    borderRadius: 2,
                    border: '2px dashed #e0e0e0'
                  }}>
                    <Repeat sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Sign in to manage subscriptions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Access your subscription dashboard and manage your deliveries.
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      onClick={() => { setSelectedTab(1); handleAccountModalClose(); }}
                      sx={{
                        background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
                        },
                      }}
                    >
                      View Subscription Plans
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {accountTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Loyalty Points
                </Typography>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  backgroundColor: '#fafafa',
                  borderRadius: 2,
                  border: '2px dashed #e0e0e0'
                }}>
                  <Loyalty sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    0 Loyalty Points
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Earn points with every purchase and redeem them for discounts.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => { setSelectedTab(0); handleAccountModalClose(); }}
                    sx={{
                      background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
                      },
                    }}
                  >
                    Start Earning Points
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa',
          borderRadius: '0 0 12px 12px'
        }}>
          <Button onClick={handleAccountModalClose}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={() => { 
              signOut(); 
              handleAccountModalClose(); 
            }}
            sx={{
              background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1e3a0f 0%, #388e3c 100%)',
              },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cart Confirmation Modal */}
      <CartConfirmationModal
        open={showCartConfirmation}
        onClose={() => setShowCartConfirmation(false)}
        cartItems={currentCartItems}
        onViewCart={() => {
          setShowCartConfirmation(false);
          setCartOpen(true);
        }}
        onCheckout={() => {
          setShowCartConfirmation(false);
          window.location.href = '/cart';
        }}
        onAddUpsell={(product) => {
          // Add upsell product to cart
          const cart = JSON.parse(localStorage.getItem("cart") || "[]");
          cart.push({
            productId: product.productId,
            name: product.name,
            priceCents: product.price,
            qty: 1,
            photoUrl: product.photoUrl
          });
          localStorage.setItem("cart", JSON.stringify(cart));
          
          // Update current cart items for modal
          setCurrentCartItems(cart);
          
          // Update cart count
          const totalQty = cart.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
          setCartCount(totalQty);
          
          // Dispatch event for cart drawer
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }}
      />

      {/* Breadcrumb Schema for SEO */}
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "https://www.chefpax.com/", position: 1 },
          { name: "Shop", item: "https://www.chefpax.com/shop", position: 2 }
        ]}
      />
    </>
  );
}
