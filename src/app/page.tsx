"use client";
import { Typography, Box, Container, Grid, Button, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { Agriculture, LocalShipping, AutoAwesome, CheckCircle } from "@mui/icons-material";

export default function Home() {
  const features = [
    {
      icon: <Agriculture sx={{ fontSize: 48, color: "#22A442" }} />,
      title: "Automated Growth",
      description: "AI-monitored growing with precision racks and computer vision quality checks.",
      details: ["Hydroponic precision", "CV quality control", "LLM scheduling"]
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48, color: "#2AB3C6" }} />,
      title: "Direct Delivery",
      description: "Local courier or Uber Direct—fresh microgreens delivered on your schedule.",
      details: ["Same-day options", "Subscription discounts", "No-contact delivery"]
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 48, color: "#22A442" }} />,
      title: "Live Harvest",
      description: "Trays delivered live for 6-10 harvests. Cut as you need for maximum nutrition.",
      details: ["6-10 harvests per tray", "Peak nutrition", "Zero waste"]
    }
  ];

  const benefits = [
    "AI-assisted scheduling & monitoring",
    "Computer vision quality checks",
    "Delivery-only (no storefront)",
    "Austin-area coverage",
    "Subscribe & save up to 15%"
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "70vh", md: "85vh" },
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #22A442 0%, #2AB3C6 100%)",
          color: "white",
          overflow: "hidden"
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: { xs: "2.5rem", md: "4rem" },
                    fontWeight: 700,
                    lineHeight: 1.15,
                    mb: 3,
                    textShadow: "0 2px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  Fresh. Local. Automated.
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.125rem", md: "1.5rem" },
                    fontWeight: 400,
                    lineHeight: 1.6,
                    mb: 4,
                    opacity: 0.95,
                    maxWidth: "600px"
                  }}
                >
                  Live microgreens grown with precision racks and AI monitoring. Harvested locally and delivered direct to your door.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    component={Link}
                    href="/shop"
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.125rem",
                      background: "#FFFFFF",
                      color: "#22A442",
                      "&:hover": {
                        background: "rgba(255,255,255,0.9)",
                        transform: "translateY(-2px)"
                      }
                    }}
                  >
                    Start Shopping
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/how-it-works"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.125rem",
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255,255,255,0.1)"
                      }
                    }}
                  >
                    How It Works
                  </Button>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="/images/austinChefPack.png"
                  alt="ChefPax microgreens live trays"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "16px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#FFFFFF" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                color: "#111214",
                mb: 2
              }}
            >
              Why Choose ChefPax?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: "1.125rem",
                color: "#5B616A",
                maxWidth: "600px",
                mx: "auto"
              }}
            >
              Three-step freshness from automated growth to your door
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      p: 3,
                      background: "linear-gradient(135deg, rgba(34, 164, 66, 0.02) 0%, rgba(42, 179, 198, 0.02) 100%)",
                      border: "1px solid rgba(34, 164, 66, 0.1)",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(34, 164, 66, 0.15)",
                        border: "1px solid rgba(34, 164, 66, 0.3)"
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 600,
                          color: "#111214",
                          mb: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#5B616A",
                          mb: 3,
                          lineHeight: 1.6
                        }}
                      >
                        {feature.description}
                      </Typography>

                      <Box sx={{ textAlign: "left" }}>
                        {feature.details.map((detail, i) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <CheckCircle sx={{ fontSize: 18, color: "#22A442" }} />
                            <Typography variant="body2" sx={{ color: "#2E3135" }}>
                              {detail}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, rgba(34, 164, 66, 0.05) 0%, rgba(42, 179, 198, 0.05) 100%)"
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                color: "#111214",
                mb: 2
              }}
            >
              What Makes Us Different
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {benefits.map((benefit, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: "12px",
                      background: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        transform: "translateX(4px)"
                      }
                    }}
                  >
                    <CheckCircle sx={{ color: "#22A442", fontSize: 24, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#111214",
                        fontWeight: 500
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              href="/shop"
              variant="contained"
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1.125rem"
              }}
            >
              Browse Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, #22A442 0%, #2AB3C6 100%)",
          color: "white",
          textAlign: "center"
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              mb: 3
            }}
          >
            Ready to Get Started?
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.125rem", md: "1.25rem" },
              mb: 4,
              opacity: 0.95
            }}
          >
            Subscribe and save up to 15% on live microgreen trays
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/shop"
              variant="contained"
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1.125rem",
                background: "#FFFFFF",
                color: "#22A442",
                "&:hover": {
                  background: "rgba(255,255,255,0.9)"
                }
              }}
            >
              View Subscription Plans
            </Button>
            
            <Button
              component={Link}
              href="/recipes"
              variant="outlined"
              size="large"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1.125rem",
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  background: "rgba(255,255,255,0.1)"
                }
              }}
            >
              See Recipes
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
