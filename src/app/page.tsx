"use client";
import { Typography, Box, Container, Stack, Button, Card, CardContent } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { keyframes, styled } from "@mui/material/styles";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Ken Burns animation (subtle zoom + drift)
const panZoom = keyframes`
  0%   { transform: scale(1.05) translate3d(0, 0, 0); }
  50%  { transform: scale(1.08) translate3d(-1.5%, -1.5%, 0); }
  100% { transform: scale(1.05) translate3d(0, 0, 0); }
`;

// Background layer with animation
const AnimatedBg = styled("div")(() => ({
  position: "absolute",
  inset: 0,
  backgroundImage: "url('/images/austinChefPack.png')",
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

// Animated background for feature cards
const AnimatedFeatureBg = styled("div")(() => ({
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(2px) brightness(0.7)",
  transformOrigin: "center center",
  animation: `${panZoom} 8s ease-in-out infinite`,
  // Reduce motion: stop animation
  ["@media (prefers-reduced-motion: reduce)"]: {
    animation: "none",
    transform: "none",
  },
}));

// Consistent button styling - matching original Shop Now button
const shopNowButtonStyle = {
  px: 3,
  py: 1,
  borderRadius: 4,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: "white",
  fontSize: "0.9rem",
  fontWeight: 600,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)",
  },
  transition: "all 0.3s ease",
};

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const features = [
    {
      icon: "/chefpax-live-tray.svg",
      title: "Live Growing Trays",
      description: "Fresh microgreens delivered as live growing trays. Cut as needed for maximum nutrition and longevity.",
      detail: "Our hydroponic systems grow microgreens to peak stage, then deliver them live so you can harvest 6-10 times per tray.",
      color: "#4CAF50",
      backgroundImage: "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
    },
    {
      icon: "/images/austinChefPack.png",
      title: "Flexible Delivery",
      description: "Order anytime and choose your preferred delivery day. Live trays delivered when it's convenient for you.",
      detail: "Skip the grocery store lines. We bring live microgreen trays directly to your door on your schedule.",
      color: "#2196F3",
      backgroundImage: "url('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
    },
    {
      icon: "/images/sunflower.png",
      title: "Grow Your Brand",
      description: "Premium live trays that elevate your culinary brand. From home chefs to professional kitchens, we help you stand out.",
      detail: "Our luxe microgreen offerings help restaurants and home cooks create Instagram-worthy dishes that grow their brand and reputation.",
      color: "#FF9800",
      backgroundImage: "url('https://images.unsplash.com/photo-1546554137-f86b9593a222?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
    }
  ];

  return (
    <>

      {/* Interactive Features Section */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 4, md: 6 },
          minHeight: { xs: "auto", md: "100vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: activeFeature === 0
            ? "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)" // Hydroponic - Green
            : activeFeature === 1
            ? "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)" // Delivery - Blue
            : activeFeature === 2
            ? "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)" // Chef Quality - Orange
            : "linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)", // Default - Green
          color: "white",
          transition: "background 0.5s ease-in-out",
          overflow: "hidden",
        }}
      >
        {/* Motion Background Images */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Hydroponic Excellence Background */}
          {activeFeature === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <AnimatedFeatureBg
                style={{
                  backgroundImage: features[0].backgroundImage,
                }}
              />
            </motion.div>
          )}

          {/* Flexible Delivery Background */}
          {activeFeature === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <AnimatedFeatureBg
                style={{
                  backgroundImage: features[1].backgroundImage,
                }}
              />
            </motion.div>
          )}

          {/* Chef Quality Background */}
          {activeFeature === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <AnimatedFeatureBg
                style={{
                  backgroundImage: features[2].backgroundImage,
                }}
              />
            </motion.div>
          )}

          {/* Default Background */}
          {activeFeature === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <AnimatedFeatureBg
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
                }}
              />
            </motion.div>
          )}
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            {/* Logo and Header */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 600,
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                Why Choose ChefPax?
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6,
                mb: 3,
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Experience the difference of live microgreen trays grown with precision and delivered fresh to your kitchen
            </Typography>

            {/* Action Buttons */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
              <Button
                component={Link}
                href="/shop"
                size="large"
                variant="contained"
                sx={shopNowButtonStyle}
              >
                View Products
              </Button>
              <Button
                component={Link}
                href="/how-it-works"
                size="large"
                variant="contained"
                sx={shopNowButtonStyle}
              >
                How It Works
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                isActive={activeFeature === index}
                onHover={setActiveFeature}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          background: "linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 3,
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Ready to Experience Fresh?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                opacity: 0.9, 
                mb: 4, 
                maxWidth: "600px", 
                mx: "auto",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Join hundreds of Austin families who trust ChefPax for their live microgreen trays and fresh, nutritious produce.
            </Typography>
            <Button
              component={Link}
              href="/shop"
              variant="contained"
              size="large"
              sx={shopNowButtonStyle}
            >
              Start Your Order
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}

// FeatureCard Component
function FeatureCard({
  feature,
  index,
  isActive,
  onHover
}: {
  feature: any;
  index: number;
  isActive: boolean;
  onHover: (index: number | null) => void;
}) {
  const handleCardInteraction = () => {
    // Toggle the card state on click/tap
    if (isActive) {
      onHover(null);
    } else {
      onHover(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={handleCardInteraction}
    >
      <Card
        sx={{
          textAlign: "center",
          p: 3,
          borderRadius: 4,
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          border: isActive ? "2px solid rgba(255, 255, 255, 0.8)" : "1px solid rgba(255, 255, 255, 0.2)",
          background: isActive
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(255, 255, 255, 0.05)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isActive ? "translateY(-8px)" : "translateY(0)",
          boxShadow: isActive
            ? "0 20px 40px rgba(0, 0, 0, 0.3)"
            : "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          // Add mobile tap feedback
          "&:active": {
            transform: "scale(0.98)",
          },
          // Show tap hint on mobile
          "@media (hover: none)": {
            position: "relative",
            "&::before": {
              content: '"Tap to learn more"',
              position: "absolute",
              bottom: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.75rem",
              opacity: 0.7,
              color: "white",
              pointerEvents: "none",
            }
          }
        }}
      >
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <motion.div
            animate={{
              scale: isActive ? 1.2 : 1,
              rotate: isActive ? 10 : 0
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80px",
              }}
            >
              <Image
                src={feature.icon}
                alt={feature.title}
                width={60}
                height={60}
                style={{
                  objectFit: "contain"
                }}
              />
            </Box>
          </motion.div>

          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: "white",
              fontWeight: 600,
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {feature.title}
          </Typography>

          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    color: "rgba(255, 255, 255, 0.9)",
                    lineHeight: 1.6,
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {feature.description}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    color: "rgba(255, 255, 255, 0.8)",
                    mb: 3,
                    lineHeight: 1.5,
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {feature.detail}
                </Typography>

                {/* Shop Now Button */}
                <Button
                  component={Link}
                  href="/shop"
                  variant="contained"
                  size="small"
                  sx={shopNowButtonStyle}
                >
                  Shop Now
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
