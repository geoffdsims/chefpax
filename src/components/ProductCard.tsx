"use client";
import { Card, CardContent, CardActions, Typography, Button, Box } from "@mui/material";
import { AddShoppingCart } from "@mui/icons-material";

interface Product {
  _id: string;
  sku: string;
  name: string;
  priceCents: number;
  unit: string;
  photoUrl?: string;
  category?: "mix" | "single" | "live_tray";
  variety?: "pea" | "sunflower" | "radish" | "amaranth" | "mixed";
  sizeOz?: number;
  weeklyCapacity?: number;
  currentWeekAvailable?: number;
}

interface ProductCardProps {
  p: Product;
  onAdd: (p: Product) => void;
}

// Get the appropriate image for each product
const getProductImage = (sku: string) => {
  switch (sku) {
    case 'SUNFLOWER_2OZ':
      return '/images/sunflower.png';
    case 'CHEFPAX_4OZ':
      return '/images/microgeens/chefPax_mix.png';
    case 'PEA_2OZ':
      return '/images/pea_shoots.png';
    case 'RADISH_2OZ':
      return '/images/radish_saxa2.png';
    case 'PEA_LIVE_TRAY':
      return '/images/pea_shoots.png';
    case 'RADISH_LIVE_TRAY':
      return '/images/radish_saxa2.png';
    default:
      return '/images/microgeens/chefPax_mix.png';
  }
};


export default function ProductCard({ p, onAdd }: ProductCardProps) {
  return (
    <Card 
      sx={{ 
        height: "100%", 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Product Image - Your beautiful microgreens photography */}
      <Box
        sx={{
          height: '320px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          src={p.photoUrl || getProductImage(p.sku)}
          alt={p.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.4s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(transparent, rgba(45, 80, 22, 0.4))'
          }}
        />

        {/* Premium badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            px: 2,
            py: 1,
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <Typography variant="caption" sx={{ 
            fontWeight: 600,
            color: 'secondary.main',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Premium
          </Typography>
        </Box>
      </Box>

            <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  display: 'block',
                  mb: 1,
                  lineHeight: 1.2
                }}
              >
                {p.sku}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: 'primary.main',
                  lineHeight: 1.3,
                  mb: 1.5,
                  fontSize: '0.95rem',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  height: 'auto',
                  minHeight: '2.6rem'
                }}
              >
                {p.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  mb: 2
                }}
              >
                {p.unit === 'tray' ? 'Live growing tray • 10×20 inches' : 'Fresh clamshell • Ready to enjoy'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Playfair Display, serif',
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: '1.3rem'
                  }}
                >
                  ${(p.priceCents/100).toFixed(2)}
                </Typography>
                
                {/* Availability indicator */}
                {p.currentWeekAvailable !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.currentWeekAvailable > 0 ? (
                      <>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'success.main'
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'success.main',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        >
                          {p.currentWeekAvailable} available
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'error.main'
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        >
                          Sold out
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>

      <CardActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={() => onAdd(p)} 
          variant="contained" 
          fullWidth
          startIcon={<AddShoppingCart />}
          size="large"
          disabled={p.currentWeekAvailable !== undefined && p.currentWeekAvailable <= 0}
          sx={{
            py: 2,
            fontSize: '1rem',
            fontWeight: 600,
            opacity: (p.currentWeekAvailable !== undefined && p.currentWeekAvailable <= 0) ? 0.6 : 1
          }}
        >
          {p.currentWeekAvailable !== undefined && p.currentWeekAvailable <= 0 
            ? 'Sold Out This Week' 
            : 'Add to Cart'
          }
        </Button>
      </CardActions>
    </Card>
  );
}
