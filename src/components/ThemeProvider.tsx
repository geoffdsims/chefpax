"use client";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

