"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Button
} from "@mui/material";
import { Close, Restaurant } from "@mui/icons-material";
import recipesData from "@/data/recipes.json";

interface RecipeModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  variety?: string;
}

export default function RecipeModal({ open, onClose, productName, variety }: RecipeModalProps) {
  // Find recipes that use this product variety
  const matchingRecipes = recipesData.recipes.filter(recipe => {
    if (!variety) return false;
    // Match by variety name (e.g., "Sunflower", "Pea", "Radish")
    const varietyName = variety.charAt(0).toUpperCase() + variety.slice(1);
    return recipe.uses.some(use => use.toLowerCase() === variety.toLowerCase() || use === varietyName);
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          background: 'linear-gradient(135deg, #2D5016 0%, #4CAF50 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Restaurant />
          <Typography variant="h6" component="span">
            Recipes with {productName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {matchingRecipes.length > 0 ? (
          matchingRecipes.map((recipe, idx) => (
            <Box key={recipe.id}>
              {idx > 0 && <Divider sx={{ my: 2 }} />}
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box
                  component="img"
                  src={recipe.image}
                  alt={recipe.title}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1
                  }}
                />
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {recipe.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ⏱️ {recipe.time}
                  </Typography>
                </Box>
              </Box>

              {/* Ingredients */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Ingredients:
              </Typography>
              <List dense sx={{ mb: 1 }}>
                {recipe.ingredients.map((ingredient, i) => (
                  <ListItem key={i} sx={{ py: 0.25, px: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      • {ingredient}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              {/* Instructions */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Instructions:
              </Typography>
              <List dense>
                {recipe.steps.map((step, i) => (
                  <ListItem key={i} sx={{ py: 0.25, px: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      {i + 1}. {step}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Restaurant sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No recipes yet for {productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check out all our recipes on the recipes page!
            </Typography>
            <Button
              component="a"
              href="/recipes"
              target="_blank"
              variant="outlined"
              sx={{ mt: 2 }}
            >
              View All Recipes
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
