import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#335e4c" },
    secondary: { main: "#c77d47" },
    background: { default: "#f5f7f4", paper: "#ffffff" },
    text: { primary: "#202a25", secondary: "#69746e" },
    success: { main: "#458468" },
    divider: "#e8ece8",
  },
  typography: {
    fontFamily: '"Inter", "Avenir Next", Avenir, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.04em" },
    h6: { fontWeight: 650, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { border: "1px solid #e8ece8", boxShadow: "0 3px 16px rgba(32, 42, 37, 0.035)" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 9 } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: "#fff" } } },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
