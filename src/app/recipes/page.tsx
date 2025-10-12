"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Grid,
  Chip
} from "@mui/material";
import Navbar from "@/components/Navbar";
import { RecipeCard, type Recipe } from "@/components/RecipeCard";
import { HealthBenefit, type Benefit } from "@/components/HealthBenefit";
import data from "@/data/recipes.json";

const CROPS = ["All", "Sunflower", "Pea", "Radish", "Broccoli", "Amaranth", "Basil"] as const;

export default function RecipesPage() {
  const [selectedCrop, setSelectedCrop] = useState<string>("All");

  const filteredRecipes = selectedCrop === "All"
    ? data.recipes
    : data.recipes.filter((r: Recipe) => r.uses.includes(selectedCrop));

  const filteredBenefits = selectedCrop === "All"
    ? data.benefits
    : data.benefits.filter((b: Benefit) => b.crop === selectedCrop);

  return (
    <>
      <Navbar />
      
      <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(34, 164, 66, 0.05) 0%, rgba(42, 179, 198, 0.05) 100%)",
          borderBottom: "1px solid rgba(34, 164, 66, 0.1)",
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontFamily: "Playfair Display, serif",
              fontSize: { xs: "2.5rem", md: "3rem" },
              fontWeight: 700,
              color: "#2D5016",
              mb: 2,
              lineHeight: 1.15
            }}
          >
            Recipes & Benefits
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: "1.125rem",
              maxWidth: "600px",
              lineHeight: 1.6
            }}
          >
            Fast recipes you'll actually make—plus evidence-based nutrition notes with peer-reviewed citations.
          </Typography>
        </Container>
      </Box>

      {/* Filter Tabs */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Tabs
          value={selectedCrop}
          onChange={(e, newValue) => setSelectedCrop(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 4,
            borderBottom: "1px solid #F6F7F8",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              color: "#5B616A",
              minHeight: 48,
              "&.Mui-selected": {
                color: "#22A442"
              }
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#22A442",
              height: 3,
              borderRadius: "3px 3px 0 0"
            }
          }}
        >
          {CROPS.map((crop) => (
            <Tab
              key={crop}
              label={crop}
              value={crop}
            />
          ))}
        </Tabs>

        {/* Recipes Section */}
        {filteredRecipes.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  color: "#2D5016"
                }}
              >
                Quick Recipes
              </Typography>
              <Chip
                label={`${filteredRecipes.length} ${filteredRecipes.length === 1 ? 'recipe' : 'recipes'}`}
                sx={{
                  backgroundColor: "#EAF7EE",
                  color: "#22A442",
                  fontWeight: 600
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
              {filteredRecipes.map((recipe: Recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                  <RecipeCard r={recipe} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Health Benefits Section */}
        {filteredBenefits.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  color: "#2D5016"
                }}
              >
                Health Benefits
              </Typography>
              <Chip
                label="Evidence-Based"
                sx={{
                  backgroundColor: "#2AB3C6",
                  color: "#FFFFFF",
                  fontWeight: 600
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
              {filteredBenefits.map((benefit: Benefit) => (
                <Grid item xs={12} md={6} key={benefit.id}>
                  <HealthBenefit b={benefit} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Empty State */}
        {filteredRecipes.length === 0 && filteredBenefits.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#5B616A"
            }}
          >
            <Typography variant="h6">
              No recipes or benefits found for {selectedCrop}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Check back soon as we add more content!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
    </>
  );
}
