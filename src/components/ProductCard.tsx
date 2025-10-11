"use client";
import { Card, CardContent, CardActions, Typography, Button, Box, Tooltip } from "@mui/material";
import { AddShoppingCart, Info } from "@mui/icons-material";

interface ProductStage {
  type: string;
  offsetDays: number;
  durationDays?: number;
  notes: string;
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  priceCents: number;
  unit: string;
  photoUrl?: string;
  category?: string;
  variety?: string;
  sizeOz?: number;
  weeklyCapacity?: number;
  currentWeekAvailable?: number;
  description?: string;
  leadTimeDays?: number;
  stages?: ProductStage[];
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


// Tooltip content with grow card details
function GrowCardTooltip({ product }: { product: Product }) {
  return (
    <Box sx={{ p: 1.5, maxWidth: 320 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#4CAF50' }}>
        {product.name}
      </Typography>
      
      {product.description && (
        <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.5 }}>
          {product.description}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        {product.leadTimeDays && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.95 }}>
            🌱 <strong>{product.leadTimeDays} days</strong> to harvest
          </Typography>
        )}
        
        {product.sizeOz && (
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.95 }}>
            📦 <strong>{product.sizeOz < 50 ? '5×5' : '10×20'}</strong> inches
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ProductCard({ p, onAdd, availability }: ProductCardProps) {
  return (
    <Tooltip
      title={<GrowCardTooltip product={p} />}
      arrow
      placement="top"
      enterDelay={300}
      leaveDelay={200}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(45, 80, 22, 0.98)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: 380,
            fontSize: '0.875rem',
            '& .MuiTooltip-arrow': {
              color: 'rgba(45, 80, 22, 0.98)',
            }
          }
        }
      }}
    >
      <Card 
        sx={{ 
          height: "100%", 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'help',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(45, 80, 22, 0.2)',
            transform: 'translateY(-2px)'
          }
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
      
      {/* Info icon hint */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '50%',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 1
          }
        }}
      >
        <Info sx={{ fontSize: 18, color: 'primary.main' }} />
      </Box>
    </Card>
    </Tooltip>
  );
}
