"use client"

import { Box, Grid, Typography, Link, IconButton, Stack, useTheme, useMediaQuery } from "@mui/material"
import FacebookIcon from "@mui/icons-material/Facebook"
import TwitterIcon from "@mui/icons-material/Twitter"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import InstagramIcon from "@mui/icons-material/Instagram"
import YouTubeIcon from "@mui/icons-material/YouTube"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import FirstCraftLogo from "../assets/images/FirstCraft-logo.png"
import { useNavigate } from "react-router-dom"

const AppStoreBadge = () => (
  <Box component="img" alt="App Store" src="/path-to-appstore-badge.png" sx={{ height: 40, mb: 1 }} />
)

const GooglePlayBadge = () => (
  <Box component="img" alt="Google Play" src="/path-to-googleplay-badge.png" sx={{ height: 40 }} />
)

const FooterLink = ({ text, href, onClick }) => (
  <Link
    href={href}
    underline="hover"
    color="inherit"
    onClick={onClick}
    sx={{
      display: "block",
      mb: 1.5,
      fontSize: "0.875rem",
      color: "text.secondary",
      transition: "color 0.2s ease, transform 0.2s ease",
      cursor: "pointer",
      "&:hover": {
        color: "primary.main",
        transform: "translateX(3px)",
      },
    }}
  >
    {text}
  </Link>
)

export default function Footer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: "background.paper", pt: 6, pb: 3, px: 2 }}>
      <Grid container>
        {/* Logo and company info */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, cursor: "pointer" }} onClick={() => navigate("/")}>
            <Box component="img" src={FirstCraftLogo} alt="First Craft logo" sx={{ height: 100 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reach us on our social media handles
          </Typography>
          <Stack direction="row" spacing={1} justifyContent={isMobile ? "center" : "flex-start"} sx={{ mb: 2 }}>
            <IconButton size="small" sx={{ bgcolor: "#1877F2", color: "white", "&:hover": { bgcolor: "#0e63d3" } }}>
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "#1DA1F2", color: "white", "&:hover": { bgcolor: "#0d8fd9" } }}>
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "#0A66C2", color: "white", "&:hover": { bgcolor: "#084e96" } }}>
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "#E4405F", color: "white", "&:hover": { bgcolor: "#d32e4d" } }}>
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "#FF0000", color: "white", "&:hover": { bgcolor: "#d90000" } }}>
              <YouTubeIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Grid>

        {/* Link Sections with increased margins */}
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-evenly",
              ml: { md: 4 },
              mt: { xs: 4, md: 0 },
            }}
          >
            <Box sx={{ mb: { xs: 3, sm: 0 }, minWidth: "140px", mr: { sm: 12 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                About
              </Typography>
              <FooterLink text="About Us" href="#" />
              <FooterLink text="Contact us" href="#" />
            </Box>

            <Box sx={{ mb: { xs: 3, sm: 0 }, minWidth: "140px", mx: { sm: 12 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                Information
              </Typography>
              <FooterLink text="Help Center" href="#" />
              <FooterLink text="Refund Policy" href="#" />
            </Box>

            <Box sx={{ minWidth: "140px", ml: { sm: 12 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                For users
              </Typography>
              <FooterLink text="Login" onClick={() => navigate("/login")} />
              <FooterLink text="Register" onClick={() => navigate("/register")} />
              <FooterLink text="Settings" href="#" />
              <FooterLink text="My Orders" href="#" />
              <FooterLink text="Sales Agent Login" onClick={() => navigate("/login?type=agent")} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Bottom section */}
      <Box
        sx={{
          mt: 5,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "grey.200",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © 2025 First Craft. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            English
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        </Box>
      </Box>
    </Box>
  )
}
