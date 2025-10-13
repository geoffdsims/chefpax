"use client";
import { Box, Container, Typography, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { motion } from "framer-motion";
import { Agriculture, Science, LocalShipping, ExpandMore, CheckCircle } from "@mui/icons-material";
import FAQSchema from "@/components/FAQSchema";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      icon: <Agriculture sx={{ fontSize: 56, color: "#22A442" }} />,
      title: "AI-Monitored Growing",
      description: "Our precision racks use LLM-assisted scheduling and computer vision to monitor growth stages.",
      details: [
        "Hydroponic precision growing",
        "Temperature & humidity monitoring",
        "Automated lighting schedules",
        "CV quality checks at harvest"
      ]
    },
    {
      number: "02",
      icon: <Science sx={{ fontSize: 56, color: "#2AB3C6" }} />,
      title: "Local Harvest",
      description: "Grown in Austin, harvested at peak nutrition, and delivered as live trays within 24 hours.",
      details: [
        "Harvested at peak stage",
        "No cold storage needed",
        "6-10 harvests per tray",
        "Cut fresh as you need"
      ]
    },
    {
      number: "03",
      icon: <LocalShipping sx={{ fontSize: 56, color: "#22A442" }} />,
      title: "Direct Delivery",
      description: "Choose local courier or Uber Direct for same-day delivery. Subscribe and save up to 15%.",
      details: [
        "Same-day delivery options",
        "Subscription discounts",
        "Austin-area coverage",
        "No-contact delivery"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do live microgreen trays work?",
      answer: "Our microgreens are delivered as live, growing trays. You can harvest them 6-10 times by cutting just above the growing mat. This keeps them fresh for weeks and ensures maximum nutrition with zero waste."
    },
    {
      question: "What's the delivery area?",
      answer: "We currently deliver to Austin, Travis County, and Williamson County via local courier or Uber Direct. Same-day delivery is available for most locations within a 40km radius."
    },
    {
      question: "How does the subscription work?",
      answer: "Subscribe for weekly, bi-weekly, or monthly deliveries and save 10-15%. You can pause, skip, or cancel anytime. Manage your subscription through your account dashboard."
    },
    {
      question: "What makes your microgreens different?",
      answer: "We use AI-assisted scheduling, computer vision quality checks, and precision hydroponic growing. Our microgreens are delivered live for maximum freshness and nutrition—no cold storage, no wilting."
    },
    {
      question: "Can I choose my delivery day?",
      answer: "Yes! When you order or subscribe, you can select your preferred delivery day. We deliver Tuesday through Saturday, with same-day options available via Uber Direct."
    },
    {
      question: "Do you have a storefront?",
      answer: "No, we're delivery-only. This allows us to focus on growing the freshest microgreens and delivering them directly to you at peak nutrition."
    }
  ];

  return (
    <>
      <FAQSchema />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(34, 164, 66, 0.05) 0%, rgba(42, 179, 198, 0.05) 100%)",
          py: { xs: 8, md: 12 },
          borderBottom: "1px solid rgba(34, 164, 66, 0.1)"
        }}
      >
        <Container maxWidth="lg">
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
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "#111214",
                mb: 3,
                textAlign: "center"
              }}
            >
              How ChefPax Works
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1.125rem", md: "1.25rem" },
                color: "#5B616A",
                textAlign: "center",
                maxWidth: "700px",
                mx: "auto",
                lineHeight: 1.6
              }}
            >
              LLM-assisted scheduling, computer-vision quality checks, and on-demand delivery options like Uber Direct.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Steps Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#FFFFFF" }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {steps.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      position: "relative",
                      overflow: "visible",
                      p: 4,
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
                    {/* Step Number */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: 20,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #22A442 0%, #2AB3C6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        boxShadow: "0 4px 20px rgba(34, 164, 66, 0.3)"
                      }}
                    >
                      {step.number}
                    </Box>

                    <CardContent sx={{ pt: 4 }}>
                      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                        {step.icon}
                      </Box>

                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 600,
                          color: "#111214",
                          mb: 2,
                          textAlign: "center"
                        }}
                      >
                        {step.title}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: "#5B616A",
                          mb: 3,
                          textAlign: "center",
                          lineHeight: 1.6
                        }}
                      >
                        {step.description}
                      </Typography>

                      <Box>
                        {step.details.map((detail, i) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                            <CheckCircle sx={{ fontSize: 20, color: "#22A442", flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: "#2E3135", lineHeight: 1.5 }}>
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

      {/* FAQ Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, rgba(34, 164, 66, 0.05) 0%, rgba(42, 179, 198, 0.05) 100%)"
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              color: "#111214",
              mb: 6,
              textAlign: "center"
            }}
          >
            Frequently Asked Questions
          </Typography>

          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Accordion
                sx={{
                  mb: 2,
                  borderRadius: "12px !important",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    boxShadow: "0 4px 16px rgba(34, 164, 66, 0.1)"
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "#22A442" }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      my: 2
                    }
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      color: "#111214",
                      fontSize: "1.125rem"
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#5B616A",
                      lineHeight: 1.6
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Container>
      </Box>
    </>
  );
}
