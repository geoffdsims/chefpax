"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { ExpandMore, AccessTime, Restaurant } from "@mui/icons-material";
import { motion } from "framer-motion";

export type Recipe = {
  id: string;
  title: string;
  image: string;
  time: string;
  ingredients: string[];
  steps: string[];
  uses: string[];
};

interface RecipeCardProps {
  r: Recipe;
}

export function RecipeCard({ r }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);

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
          overflow: "hidden",
          transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 32px rgba(17,18,20,.12)"
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={r.image}
          alt={r.title}
          sx={{
            objectFit: "cover",
            backgroundColor: "#F6F7F8"
          }}
        />
        
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              color: "#111214",
              mb: 2,
              lineHeight: 1.3
            }}
          >
            {r.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 18, color: "#5B616A" }} />
              <Typography variant="body2" color="text.secondary">
                {r.time}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Restaurant sx={{ fontSize: 18, color: "#5B616A" }} />
              <Typography variant="body2" color="text.secondary">
                {r.uses.join(", ")}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Box
              onClick={() => setExpanded(!expanded)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                color: "#22A442",
                "&:hover": {
                  color: "#1B7F35"
                }
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  fontSize: "0.875rem"
                }}
              >
                View Recipe
              </Typography>
              <IconButton
                size="small"
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.22s"
                }}
              >
                <ExpandMore />
              </IconButton>
            </Box>

            <Collapse in={expanded} timeout={320}>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#111214",
                    mb: 1
                  }}
                >
                  Ingredients:
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {r.ingredients.map((ingredient, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                      <ListItemText
                        primary={ingredient}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary"
                        }}
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "#111214",
                    mb: 1
                  }}
                >
                  Instructions:
                </Typography>
                <List dense>
                  {r.steps.map((step, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                      <ListItemText
                        primary={`${idx + 1}. ${step}`}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary"
                        }}
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Collapse>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
