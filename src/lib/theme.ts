import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: { 
    mode: "light", 
    primary: { 
      main: "#2D5016", // Deep forest green - from microgreens
      light: "#4A7C59", // Lighter green
      dark: "#1A3009" // Darker forest green
    }, 
    secondary: { 
      main: "#D4AF37", // Luxurious gold
      light: "#E6C896", // Light gold
      dark: "#B8941F" // Dark gold
    },
    background: {
      default: "#FEFEFE", // Cream white
      paper: "#FFFFFF" // Pure white
    },
    text: {
      primary: "#2C2C2C", // Rich dark gray
      secondary: "#6B6B6B" // Medium gray
    },
    success: {
      main: "#4A7C59", // Fresh green
      light: "#7BA05B",
      dark: "#2D5016"
    },
    warning: {
      main: "#D4AF37", // Gold accent
      light: "#E6C896",
      dark: "#B8941F"
    }
  },
  typography: { 
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: 'Playfair Display, Georgia, serif',
      fontWeight: 700,
      fontSize: '4rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontFamily: 'Playfair Display, Georgia, serif',
      fontWeight: 600,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontFamily: 'Playfair Display, Georgia, serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h4: {
      fontFamily: 'Playfair Display, Georgia, serif',
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4
    },
    h5: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4
    },
    h6: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.4
    },
    body1: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.7,
      fontWeight: 400
    },
    body2: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400
    },
    button: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          padding: '14px 28px',
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        contained: {
          backgroundColor: '#2D5016',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(45, 80, 22, 0.3)',
          '&:hover': {
            backgroundColor: '#1A3009',
            boxShadow: '0 8px 30px rgba(45, 80, 22, 0.4)',
            transform: 'translateY(-2px)'
          }
        },
        outlined: {
          borderColor: '#D4AF37',
          color: '#D4AF37',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#B8941F',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            borderWidth: '2px'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-8px)',
            borderColor: 'rgba(212, 175, 55, 0.2)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#2C2C2C',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FEFEFE',
            '& fieldset': {
              borderColor: 'rgba(212, 175, 55, 0.2)',
              borderWidth: '2px'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(212, 175, 55, 0.4)'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D4AF37'
            }
          }
        }
      }
    }
  }
});
