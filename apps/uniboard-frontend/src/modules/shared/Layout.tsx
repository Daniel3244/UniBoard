import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";

const navItems = [
  { to: "/login", label: "Logowanie" },
  { to: "/register", label: "Rejestracja" },
  { to: "/dashboard", label: "Dashboard" },
];

export const Layout = () => {
  const { isAuthenticated, auth, logout } = useAuthContext();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/dashboard"
              sx={{
                flexGrow: 1,
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              UniBoard
            </Typography>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  variant={
                    location.pathname === item.to ? "outlined" : "text"
                  }
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={handleMenuClose}
                    selected={location.pathname === item.to}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle2">{auth.email}</Typography>
                  <Typography variant="caption" color="inherit">
                    Rola: {auth.role}
                  </Typography>
                </Box>
                <Button color="inherit" onClick={logout}>
                  Wyloguj
                </Button>
              </Box>
            ) : (
              <Link
                component={RouterLink}
                to="/login"
                color="inherit"
                underline="hover"
              >
                Zaloguj
              </Link>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{ flexGrow: 1, width: "100%", display: "flex", flexDirection: "column" }}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          backgroundColor: "#111827",
          color: "white",
        }}
      >
        <Typography variant="body2">
          UniBoard • panel demo – {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};
