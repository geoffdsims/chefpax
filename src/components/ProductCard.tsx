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
      {/* Product Image - Compact */}
      <Box
        sx={{
          height: '200px',
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
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />

        {/* Category badge */}
        {(p.category === 'premium' || p.category === 'bundle') && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              px: 1.5,
              py: 0.5
            }}
          >
            <Typography variant="caption" sx={{ 
              fontWeight: 700,
              color: p.category === 'premium' ? 'secondary.main' : 'primary.main',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              letterSpacing: '0.5px'
            }}>
              {p.category}
            </Typography>
          </Box>
        )}

        {/* Availability badge */}
        {availability && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              px: 1,
              py: 0.5
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 
                  availability.status === 'sold_out' ? 'error.main' :
                  availability.status === 'low_stock' ? 'warning.main' : 'success.main'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.65rem'
              }}
            >
              {availability.status === 'sold_out' ? 'Sold Out' :
               availability.status === 'low_stock' ? 'Low Stock' : 'In Stock'}
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            lineHeight: 1.3,
            mb: 1,
            fontSize: '0.95rem'
          }}
        >
          {p.name}
        </Typography>

        {/* Price row - compact */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.4rem'
            }}
          >
            ${(p.priceCents/100).toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'success.main',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            ${((p.priceCents * 0.9)/100).toFixed(2)}/week
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.4
          }}
        >
          {p.unit === 'bundle' ? '🎁 Bundle • Multiple trays' :
           p.unit === 'tray' && p.sizeOz && p.sizeOz < 50 ? '5×5 live tray • 4-6 harvests' :
           p.unit === 'tray' ? '10×20 live tray • 6-10 harvests' : 
           'Fresh & ready to use'}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={() => onAdd(p)} 
          variant="contained" 
          fullWidth
          startIcon={<AddShoppingCart />}
          disabled={availability?.status === 'sold_out'}
          sx={{
            py: 1.5,
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: availability?.status === 'sold_out' ? 0.6 : 1
          }}
        >
          {availability?.status === 'sold_out' ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
}
