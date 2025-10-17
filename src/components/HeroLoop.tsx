"use client";

import React from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { keyframes, styled } from "@mui/material/styles";
import Link from "next/link";

// 6s Ken Burns (subtle zoom + drift)
const panZoom = keyframes`
  0%   { transform: scale(1.05) translate3d(0, 0, 0); }
  50%  { transform: scale(1.08) translate3d(-1.5%, -1.5%, 0); }
  100% { transform: scale(1.05) translate3d(0, 0, 0); }
`;

const heroImages = [
  '/images/heros/thumbnail_IMG_8894-1.jpg',
  '/images/heros/thumbnail_IMG_8913.jpg',
  '/images/heros/thumbnail_IMG_8999.jpg',
  '/images/heros/thumbnail_IMG_9029.jpg',
  '/images/heros/thumbnail_5D717A23-C898-4B5B-A217-726EAE945301.jpg',
  '/images/heros/thumbnail_IMG_BBAD2ACB-5B63-4729-A62E-EE9509A71E79.jpg',
  '/images/heros/thumbnail_IMG_CFCFE8C3-B697-4A91-A0CE-A79192CF18A9.jpg',
  '/images/heros/thumbnail_IMG_CFF37E9A-0923-4499-BC17-25C833B5203D.jpg',
];

// Background layer with animation
const AnimatedBg = styled("div")<{ image: string }>(({ image }) => ({
  position: "absolute",
  inset: 0,
  backgroundImage: `url('${image}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "saturate(1.05) contrast(1.05)",
  transformOrigin: "center center",
  animation: `${panZoom} 6s ease-in-out infinite`,
  // Reduce motion: stop animation
  ["@media (prefers-reduced-motion: reduce)"]: {
    animation: "none",
    transform: "none",
  },
}));

export default function HeroLoop() {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000); // Change image every 8 seconds
    return () => clearInterval(interval);
  }, []);

  function handleSubscribe() {
    // Redirect to shop page where users can select subscription option
    window.location.href = "/shop";
  }

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: { xs: "70vh", md: "80vh" },
        overflow: "hidden",
        bgcolor: "#000",
        color: "#fff",
      }}
      aria-label="ChefPax microgreens hero"
    >
      <AnimatedBg image={heroImages[currentImageIndex]} aria-hidden />

      {/* soft vignette for luxe look */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            component="img"
            src="/logo.png"
            alt="ChefPax"
            sx={{
              height: { xs: 70, md: 100 },
              filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))'
            }}
          />

          <Typography
            variant="h6"
            sx={{ opacity: 0.95, textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
          >
            Fresh • Hydroponic • Local — Order Anytime, Choose Your Delivery
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={1}>
            <Button
              onClick={handleSubscribe}
              size="large"
              variant="contained"
              sx={{
                px: 4,
                borderRadius: "999px",
                backgroundColor: "#D4AF37",
                boxShadow: "0 8px 24px rgba(212,175,55,0.35)",
                ":hover": { backgroundColor: "#B8941F" },
                color: "#000",
                fontWeight: 600,
              }}
            >
              Subscribe Weekly
            </Button>
            <Button
              component={Link}
              href="/shop"
              size="large"
              variant="outlined"
              sx={{
                px: 4,
                borderRadius: "999px",
                borderColor: "rgba(255,255,255,0.65)",
                color: "#fff",
                ":hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.06)" },
              }}
            >
              View Products
            </Button>
            <Button
              component={Link}
              href="/how-it-works"
              size="large"
              variant="outlined"
              sx={{
                px: 4,
                borderRadius: "999px",
                borderColor: "rgba(255,255,255,0.65)",
                color: "#fff",
                ":hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.06)" },
              }}
            >
              How It Works
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

