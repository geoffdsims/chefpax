"use client";
import React from "react";
import { Card, CardContent, Typography, Box, Chip, Link } from "@mui/material";
import { Science, OpenInNew } from "@mui/icons-material";
import { motion } from "framer-motion";

export type Benefit = {
  id: string;
  crop: "Sunflower" | "Pea" | "Radish" | "Broccoli" | "Amaranth" | "Shiso" | "Basil" | "Sorrel";
  claim: string;
  strength: "emerging" | "moderate" | "strong";
  citation: {
    title: string;
    source: string;
    url: string;
    year: number;
  };
};

interface HealthBenefitProps {
  b: Benefit;
}

export function HealthBenefit({ b }: HealthBenefitProps) {
  const badgeConfig = {
    strong: { bg: "#22A442", color: "#FFFFFF", label: "Strong Evidence" },
    moderate: { bg: "#2AB3C6", color: "#111214", label: "Moderate Evidence" },
    emerging: { bg: "#F6F7F8", color: "#5B616A", label: "Emerging Research" }
  };

  const badge = badgeConfig[b.strength];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, rgba(34, 164, 66, 0.02) 0%, rgba(42, 179, 198, 0.02) 100%)",
          border: "1px solid rgba(34, 164, 66, 0.1)",
          transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 32px rgba(17,18,20,.08)",
            border: "1px solid rgba(34, 164, 66, 0.2)"
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header with crop name and evidence badge */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Science sx={{ color: "#22A442", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  color: "#111214",
                  fontSize: "1.125rem"
                }}
              >
                {b.crop}
              </Typography>
            </Box>
            
            <Chip
              label={badge.label}
              size="small"
              sx={{
                backgroundColor: badge.bg,
                color: badge.color,
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 24
              }}
            />
          </Box>

          {/* Claim */}
          <Typography
            variant="body2"
            sx={{
              color: "#2E3135",
              lineHeight: 1.6,
              mb: 2
            }}
          >
            {b.claim}
          </Typography>

          {/* Citation */}
          <Box
            sx={{
              pt: 2,
              borderTop: "1px solid rgba(34, 164, 66, 0.1)"
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "#5B616A",
                mb: 0.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em"
              }}
            >
              Source:
            </Typography>
            <Link
              href={b.citation.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#22A442",
                fontSize: "0.8125rem",
                fontWeight: 500,
                "&:hover": {
                  color: "#1B7F35"
                }
              }}
            >
              <span>{b.citation.title}</span>
              <OpenInNew sx={{ fontSize: 14 }} />
            </Link>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "#5B616A",
                mt: 0.5,
                fontSize: "0.75rem"
              }}
            >
              {b.citation.source}, {b.citation.year}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
