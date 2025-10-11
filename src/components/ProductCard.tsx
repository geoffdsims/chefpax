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

interface AvailabilityStatus {
  status: "sold_out" | "low_stock" | "in_stock";
  message: string;
}

interface ProductCardProps {
  p: Product;
  onAdd: (p: Product) => void;
  availability?: AvailabilityStatus | null;
}

// Get the appropriate image for each product
const getProductImage = (sku: string) => {
  switch (sku) {
    case 'CHEFPAX_MIX_LIVE_TRAY':
    case 'CHEFPAX_PREMIUM_MIX_LIVE_TRAY':
      return '/images/microgeens/chefPax_mix.png';
    case 'PEA_LIVE_TRAY':
    case 'PEA_PREMIUM_LIVE_TRAY':
      return '/images/pea_shoots.png';
    case 'RADISH_LIVE_TRAY':
    case 'RADISH_PREMIUM_LIVE_TRAY':
      return '/images/radish_saxa2.png';
    case 'SUNFLOWER_LIVE_TRAY':
    case 'SUNFLOWER_PREMIUM_LIVE_TRAY':
      return '/images/sunflower.png';
    case 'AMARANTH_LIVE_TRAY':
      return '/images/amaranth_dreads.png';
    default:
      return '/images/microgeens/chefPax_mix.png';
  }
};


export default function ProductCard({ p, onAdd, availability }: ProductCardProps) {
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

        {/* Premium badge - only show on premium items */}
        {p.sku.includes('PREMIUM') && (
          <Box
            className="premium-badge-shimmer"
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
        )}
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
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
                  mb: 2,
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}
              >
                {p.unit === 'tray' ? 'Live growing tray • 10×20 inches • Cut as needed' : 'Fresh clamshell • Ready to enjoy'}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontWeight: 700,
                      color: 'primary.main',
                      fontSize: '1.3rem'
                    }}
                  >
                    ${(p.priceCents/100).toFixed(2)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'success.main',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    display: 'inline-block',
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  }}
                >
                  ${((p.priceCents * 0.9)/100).toFixed(2)} with subscription
                </Typography>
              </Box>
                
                {/* Availability indicator */}
                {availability && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 
                          availability.status === 'sold_out' ? 'error.main' :
                          availability.status === 'low_stock' ? 'warning.main' : 'success.main'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 
                          availability.status === 'sold_out' ? 'error.main' :
                          availability.status === 'low_stock' ? 'warning.main' : 'success.main',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      }}
                    >
                      {availability.message}
                    </Typography>
                  </Box>
                )}
            </CardContent>

      <CardActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={() => onAdd(p)} 
          variant="contained" 
          fullWidth
          startIcon={<AddShoppingCart />}
          size="large"
          disabled={availability?.status === 'sold_out'}
          sx={{
            py: 2,
            fontSize: '1rem',
            fontWeight: 600,
            opacity: availability?.status === 'sold_out' ? 0.6 : 1
          }}
        >
          {availability?.status === 'sold_out' 
            ? 'Sold Out' 
            : 'Add to Cart'
          }
        </Button>
      </CardActions>
    </Card>
  );
}
