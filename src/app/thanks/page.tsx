"use client";
import { useSearchParams } from "next/navigation";
import { Container, Typography, Button, Stack, Box } from "@mui/material";
import Link from "next/link";

export default function Thanks() {
  const params = useSearchParams();
  const d = params.get("d") ? new Date(params.get("d")!) : null;

  // Clear the cart after successful purchase
  if (typeof window !== "undefined") {
    localStorage.removeItem("cart");
  }

  return (
    <Container sx={{ py: 8, textAlign: "center", maxWidth: 800 }}>
      <Stack spacing={4} alignItems="center">
        <Typography 
          variant="h2" 
          sx={{ 
            fontFamily: 'Playfair Display, serif',
            color: 'primary.main',
            fontWeight: 700
          }}
        >
          Thank You!
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary"
          sx={{ fontWeight: 300 }}
        >
          Your ChefPax order is confirmed
        </Typography>
        
        {d && (
          <Box sx={{ 
            p: 4, 
            backgroundColor: "background.paper", 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.05)',
            maxWidth: '500px'
          }}>
            <Typography variant="h5" color="primary.main" gutterBottom>
              Delivery Information
            </Typography>
            <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
              {d.toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Delivery window: 9:00 AM - 1:00 PM
            </Typography>
          </Box>
        )}

        <Typography variant="body1" sx={{ maxWidth: 600 }}>
          We&apos;ll send you a confirmation email shortly. Your fresh microgreens will be 
          harvested the night before delivery and brought to your door on Friday.
        </Typography>

        <Stack direction="row" spacing={3} sx={{ mt: 6 }}>
          <Button 
            component={Link} 
            href="/shop" 
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(45, 80, 22, 0.3)'
              }
            }}
          >
            Order Again
          </Button>
          <Button 
            component={Link} 
            href="/" 
            variant="outlined"
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: 'primary.dark',
                color: 'primary.dark',
                backgroundColor: 'rgba(45, 80, 22, 0.04)'
              }
            }}
          >
            Back to Home
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
