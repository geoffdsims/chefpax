import { createTheme } from "@mui/material/styles";

// ChefPax Design System (WCAG 2.0 AA Compliant)
export const designTokens = {
  colors: {
    brand: {
      100: "#EAF7EE",
      600: "#22A442",
      700: "#1B7F35"
    },
    accent: {
      600: "#2AB3C6",
      700: "#1D8795"
    },
    ink: {
      900: "#111214",
      700: "#2E3135",
      500: "#5B616A"
    },
    paper: "#FFFFFF",
    fiber: "#F6F7F8",
    semantic: {
      success: "#2E7D32",
      warning: "#B26A00",
      error: "#C62828"
    }
  },
  typography: {
    fontFamily: {
      heading: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system"].join(","),
      body: ["Inter", "ui-sans-serif", "system-ui", "-apple-system"].join(",")
    },
    scale: {
      xl3: "3rem",        // 48px
      xl2: "2.25rem",     // 36px
      xl: "1.75rem",      // 28px
      lg: "1.5rem",       // 24px
      md: "1.25rem",      // 20px
      base: "1.125rem",   // 18px
      sm: "1rem"          // 16px
    }
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  borderRadius: {
    card: 16,
    pill: 9999
  },
  shadows: {
    sm: "0 1px 2px rgba(17,18,20,.07)",
    md: "0 6px 18px rgba(17,18,20,.08)",
    lg: "0 12px 32px rgba(17,18,20,.10)"
  },
  gradients: {
    primary: "linear-gradient(135deg, #22A442 0%, #2AB3C6 100%)"
  },
  motion: {
    ease: [0.22, 1, 0.36, 1],
    duration: {
      enter: 320,
      exit: 220
    }
  }
};

// MUI Theme with ChefPax design system
export const chefPaxTheme = createTheme({
  palette: {
    primary: {
      main: designTokens.colors.brand[600],
      dark: designTokens.colors.brand[700],
      light: designTokens.colors.brand[100],
      contrastText: designTokens.colors.paper
    },
    secondary: {
      main: designTokens.colors.accent[600],
      dark: designTokens.colors.accent[700],
      contrastText: designTokens.colors.ink[900]
    },
    background: {
      default: designTokens.colors.paper,
      paper: designTokens.colors.fiber
    },
    text: {
      primary: designTokens.colors.ink[900],
      secondary: designTokens.colors.ink[500]
    },
    success: {
      main: designTokens.colors.semantic.success
    },
    warning: {
      main: designTokens.colors.semantic.warning
    },
    error: {
      main: designTokens.colors.semantic.error
    }
  },
  shape: {
    borderRadius: designTokens.borderRadius.card
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily.body,
    h1: {
      fontFamily: designTokens.typography.fontFamily.heading,
      fontWeight: 700,
      fontSize: designTokens.typography.scale.xl3,
      lineHeight: 1.15,
      letterSpacing: "-0.01em"
    },
    h2: {
      fontFamily: designTokens.typography.fontFamily.heading,
      fontWeight: 700,
      fontSize: designTokens.typography.scale.xl2,
      lineHeight: 1.2,
      letterSpacing: "-0.01em"
    },
    h3: {
      fontFamily: designTokens.typography.fontFamily.heading,
      fontWeight: 600,
      fontSize: designTokens.typography.scale.xl,
      lineHeight: 1.3
    },
    h4: {
      fontFamily: designTokens.typography.fontFamily.heading,
      fontWeight: 600,
      fontSize: designTokens.typography.scale.lg,
      lineHeight: 1.4
    },
    h5: {
      fontFamily: designTokens.typography.fontFamily.heading,
      fontWeight: 600,
      fontSize: designTokens.typography.scale.md,
      lineHeight: 1.5
    },
    h6: {
      fontFamily: designTokens.typography.fontFamily.heading,
      fontWeight: 600,
      fontSize: designTokens.typography.scale.base,
      lineHeight: 1.5
    },
    body1: {
      fontSize: designTokens.typography.scale.base,
      lineHeight: 1.6
    },
    body2: {
      fontSize: designTokens.typography.scale.sm,
      lineHeight: 1.6
    },
    button: {
      letterSpacing: "0.02em",
      textTransform: "none",
      fontWeight: 600
    }
  },
  shadows: [
    "none",
    designTokens.shadows.sm,
    designTokens.shadows.md,
    designTokens.shadows.lg,
    ...Array(21).fill(designTokens.shadows.lg)
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.pill,
          padding: "12px 24px",
          fontSize: designTokens.typography.scale.base,
          fontWeight: 600,
          textTransform: "none",
          boxShadow: designTokens.shadows.sm,
          transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: designTokens.shadows.md
          },
          "&:active": {
            transform: "scale(0.98)"
          }
        },
        containedPrimary: {
          background: designTokens.gradients.primary,
          "&:hover": {
            background: designTokens.colors.brand[700]
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.card,
          boxShadow: designTokens.shadows.md,
          transition: "all 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": {
            boxShadow: designTokens.shadows.lg,
            transform: "translateY(-2px)"
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.pill,
          fontWeight: 600
        }
      }
    }
  }
});
