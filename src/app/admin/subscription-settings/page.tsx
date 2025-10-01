"use client";
import React from "react";
import { Container, Typography, Box } from "@mui/material";
import SubscriptionSettingsManager from "@/components/SubscriptionSettingsManager";

export default function AdminSubscriptionSettingsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Admin: Subscription Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage which products can be subscribed to and their subscription pricing.
        </Typography>
      </Box>
      
      <SubscriptionSettingsManager />
    </Container>
  );
}
