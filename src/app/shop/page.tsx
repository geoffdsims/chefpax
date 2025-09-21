"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Container, Box, Snackbar, AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Shop() {
  const { data } = useSWR("/api/products", fetcher);
  const [notice, setNotice] = useState<string | undefined>();
  const [cartOpen, setCartOpen] = useState(false);
  const { data: session } = useSession();

  // Fallback products if API fails
  const fallbackProducts: Product[] = [
    { _id: "fallback-1", sku: "SUNFLOWER_2OZ", name: "Sunflower Microgreens — 2 oz", priceCents: 500, unit: "clamshell", active: true, sort: 1 },
    { _id: "fallback-2", sku: "CHEFPAX_4OZ", name: "ChefPax Mix — 4 oz", priceCents: 700, unit: "clamshell", active: true, sort: 2 },
    { _id: "fallback-3", sku: "RADISH_TRAY", name: "Radish Microgreens — Live Tray", priceCents: 2900, unit: "tray", active: true, sort: 3 },
    { _id: "fallback-4", sku: "PEA_SHOOTS_TRAY", name: "Pea Shoots — Live Tray", priceCents: 3000, unit: "tray", active: true, sort: 4 },
    { _id: "fallback-5", sku: "MIXED_SUNFLOWER_TRAY", name: "Mixed Sunflower — Live Tray", priceCents: 3100, unit: "tray", active: true, sort: 5 },
    { _id: "fallback-6", sku: "RED_AMARANTH_TRAY", name: "Red Amaranth Microgreens — Live Tray", priceCents: 3200, unit: "tray", active: true, sort: 6 },
  ];

  const products = React.useMemo(() => {
    return data && Array.isArray(data) ? data : fallbackProducts;
  }, [data]);

  function addToCart(p: Product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ productId: p._id, name: p.name, priceCents: p.priceCents, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    setNotice(`${p.name} added to cart`);
  }

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: '80px' }}>
          <Typography 
            variant="h6" 
            component={Link} 
            href="/" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            ChefPax
          </Typography>
          
          {/* Auth buttons */}
          {session ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button component={Link} href="/account" variant="text" size="small">
                Account
              </Button>
              <Button onClick={() => signOut()} variant="text" size="small">
                Sign Out
              </Button>
            </Box>
          ) : (
            <Button onClick={() => signIn()} variant="text" size="small">
              Sign In
            </Button>
          )}
          
          <IconButton onClick={() => setCartOpen(true)} sx={{ color: 'text.primary' }}>
            <ShoppingCart />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 8 }}>

               {/* Products Grid */}
               <Box sx={{
                 display: 'grid',
                 gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                 gap: 4,
                 mb: 8
               }}>
          {products?.map((p: Product, index: number) => (
            <Box key={`${p.sku}-${p._id || index}`}>
              <ProductCard p={p} onAdd={addToCart} />
            </Box>
          ))}
        </Box>

        {/* Additional Info */}
        <Box sx={{ 
          backgroundColor: '#FAFAFA',
          borderRadius: 2,
          p: 4,
          border: '1px solid #E0E0E0'
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Delivery Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Order by Wednesday 6:00 PM for Friday delivery • Austin area only • $5 delivery fee
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
