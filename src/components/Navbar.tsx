"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Badge,
  Button
} from "@mui/material";
import { ShoppingCart, Menu as MenuIcon } from "@mui/icons-material";

export default function Navbar() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  // Load cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalQuantity = cart.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
      setCartCount(totalQuantity);
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  return (
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
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            href="/"
            sx={{
              fontWeight: 600,
              textDecoration: "none",
              color: "white",
              fontFamily: "Playfair Display, serif",
              "&:hover": {
                opacity: 0.8
              }
            }}
          >
            ChefPax
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 3 }}>
            <Typography
              component={Link}
              href="/shop"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { opacity: 0.8 }
              }}
            >
              Shop
            </Typography>
            <Typography
              component={Link}
              href="/recipes"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { opacity: 0.8 }
              }}
            >
              Recipes
            </Typography>
            <Typography
              component={Link}
              href="/how-it-works"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { opacity: 0.8 }
              }}
            >
              How It Works
            </Typography>
          </Box>

          {/* Right side - Cart and Account */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              component={Link}
              href="/cart"
              sx={{ color: "white" }}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {session ? (
              <Button
                component={Link}
                href="/account"
                variant="text"
                size="small"
                sx={{ color: "white" }}
              >
                Account
              </Button>
            ) : (
              <Button
                onClick={() => signIn("google")}
                variant="text"
                size="small"
                sx={{ color: "white" }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
