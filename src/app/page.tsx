"use client";
import { Typography, Box, Container, Stack } from "@mui/material";
import HeroLoop from "@/components/HeroLoop";

export default function Home() {
  return (
    <>
      <HeroLoop />

      {/* Features Section */}
      <Box sx={{ 
        py: 16, 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(254, 254, 254, 0.9) 100%)'
      }}>
        <Container maxWidth="lg">
          <Stack spacing={12}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
                color: 'primary.main',
                mb: 3
              }}>
                Our Collection
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ 
                maxWidth: '600px',
                mx: 'auto',
                fontWeight: 400,
                mb: 4
              }}>
                Carefully selected microgreens, grown hydroponically and harvested at peak nutrition.
                Each variety is chosen for its exceptional flavor and nutritional profile.
              </Typography>
              <Typography variant="h5" sx={{ 
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
                color: 'primary.main',
                mb: 3
              }}>
                Why Choose Us?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ 
                maxWidth: '600px',
                mx: 'auto',
                fontWeight: 400
              }}>
                Experience the difference of artisanal microgreens grown with passion and precision
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 6 
            }}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  borderColor: 'rgba(212, 175, 55, 0.2)'
                }
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 3
                }}>
                  Hydroponic Excellence
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Grown without soil in controlled environments for maximum nutrition and consistent quality.
                </Typography>
              </Box>
              
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  borderColor: 'rgba(212, 175, 55, 0.2)'
                }
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 3
                }}>
                  Fresh Delivery
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Harvested the night before delivery and brought directly to your door in Austin.
                </Typography>
              </Box>
              
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  borderColor: 'rgba(212, 175, 55, 0.2)'
                }
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 3
                }}>
                  Chef Quality
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Premium varieties selected for professional kitchens and discerning home cooks.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
