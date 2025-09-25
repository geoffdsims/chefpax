"use client";

import { useState, useRef, Suspense } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";


// Step Card Component
function StepCard({ 
  step, 
  index, 
  isActive, 
  onHover 
}: { 
  step: any; 
  index: number; 
  isActive: boolean; 
  onHover: (index: number | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      onHoverStart={() => onHover(index)}
      onHoverEnd={() => onHover(null)}
    >
      <Card
        sx={{
          textAlign: "center",
          p: 2,
          borderRadius: 4,
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          border: isActive ? "2px solid #2D5016" : "1px solid rgba(45, 80, 22, 0.1)",
          background: isActive 
            ? "linear-gradient(135deg, rgba(45, 80, 22, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)"
            : "white",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isActive ? "translateY(-4px)" : "translateY(0)",
          boxShadow: isActive 
            ? "0 8px 25px rgba(45, 80, 22, 0.2)" 
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <motion.div
            animate={{ 
              scale: isActive ? 1.1 : 1,
              rotate: isActive ? 5 : 0 
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Box
              sx={{
                color: step.color,
                mb: 1,
                display: "flex",
                justifyContent: "center",
                fontSize: "2.5rem",
              }}
            >
              {step.icon}
            </Box>
          </motion.div>
          
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              color: "#2D5016",
            }}
          >
            {step.title}
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
                  color="text.secondary"
                  sx={{ 
                    mb: 2
                  }}
                >
                  {step.description}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: "italic",
                    color: step.color,
                    mb: 3
                  }}
                >
                  {step.detail}
                </Typography>
                
                {/* Start Shopping Now Button */}
                <Button
                  variant="contained"
                  size="small"
                  href="/shop"
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 4,
                    backgroundColor: "#2D5016",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    border: "1px solid rgba(45, 80, 22, 0.2)",
                    "&:hover": {
                      backgroundColor: "#1A3009",
                      boxShadow: "0 4px 15px rgba(45, 80, 22, 0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Start Shopping Now
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      icon: "📱",
      title: "Order Anytime",
      description: "Place your order whenever it's convenient for you. No more Wednesday cutoffs!",
      detail: "Our flexible ordering system means you can order live microgreen trays whenever you need them.",
      color: "#2D5016",
    },
    {
      icon: "🌱",
      title: "Live Growing Trays",
      description: "We deliver live microgreen trays at peak growing stage for maximum nutrition and longevity.",
      detail: "Each tray is carefully grown and delivered at the perfect stage, giving you 6-10 harvests of fresh microgreens.",
      color: "#4CAF50",
    },
    {
      icon: "🚚",
      title: "Flexible Delivery",
      description: "Choose your preferred delivery date. Live trays delivered when you need them.",
      detail: "Our local Austin delivery network ensures your live microgreen trays arrive fresh and ready to grow.",
      color: "#2196F3",
    },
    {
      icon: "✨",
      title: "Cut & Enjoy",
      description: "Cut fresh microgreens as needed. Subscribe for 10% savings and weekly tray deliveries.",
      detail: "Experience the ultimate freshness - cut your microgreens right when you need them for maximum nutrition and flavor.",
      color: "#FF9800",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FEFEFE" }}>
      {/* Hero Section with Dynamic Motion Backgrounds */}
      <Box
        sx={{
          background: activeStep === 0 
            ? "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)" // Order Online - Blue
            : activeStep === 1 
            ? "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)" // Fresh Harvest - Green
            : activeStep === 2 
            ? "linear-gradient(135deg, #1565C0 0%, #2196F3 100%)" // Quick Delivery - Blue
            : activeStep === 3 
            ? "linear-gradient(135deg, #E65100 0%, #FF9800 100%)" // Enjoy Fresh - Orange
            : "linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)", // Default - Green
          color: "white",
          py: 4,
          position: "relative",
          overflow: "hidden",
          transition: "background 0.5s ease-in-out",
        }}
      >
        {/* Motion Background Videos */}
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
          {/* Step 0: Order Online - Person ordering on phone/laptop */}
          {activeStep === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover",
                filter: "blur(2px) brightness(0.7)",
              }}
            />
          )}

          {/* Step 1: Fresh Harvest - Person harvesting microgreens */}
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover",
                filter: "blur(2px) brightness(0.7)",
              }}
            />
          )}

          {/* Step 2: Quick Delivery - Food delivery person */}
          {activeStep === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "url('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover",
                filter: "blur(2px) brightness(0.7)",
              }}
            />
          )}

          {/* Step 3: Enjoy Fresh - Person enjoying fresh food */}
          {activeStep === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "url('https://images.unsplash.com/photo-1546554137-f86b9593a222?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover",
                filter: "blur(2px) brightness(0.7)",
              }}
            />
          )}

          {/* Default: Microgreens growing */}
          {activeStep === null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80') center/cover",
                filter: "blur(2px) brightness(0.7)",
              }}
            />
          )}
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                sx={{
                  color: "white",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  fontSize: "2.5rem",
                  fontWeight: 600,
                }}
              >
                How ChefPax Works
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                sx={{
                  maxWidth: 500,
                  opacity: 0.9,
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                From our growing facility to your kitchen in Austin - here's how we bring you live microgreen trays
              </Typography>
            </motion.div>
          </Stack>
        </Container>
      </Box>


      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              borderRadius: 4,
              background: "linear-gradient(135deg, rgba(45, 80, 22, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)",
              border: "1px solid rgba(45, 80, 22, 0.2)",
            }}
          >
            
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
                gap: 2,
                mb: 3,
                alignItems: "start",
              }}
            >
              {steps.map((step, index) => (
                <StepCard
                  key={index}
                  step={step}
                  index={index}
                  isActive={activeStep === index}
                  onHover={setActiveStep}
                />
              ))}
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="text"
                href="/"
                sx={{
                  color: "#2D5016",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textDecoration: "underline",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "none",
                  },
                }}
              >
                ← Back to Home
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
