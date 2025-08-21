import { Typography, Button, Box, Paper, useMediaQuery, useTheme } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import banner from "../../assets/images/banner.png"
import { LocalAtm, Groups } from "@mui/icons-material"

// Banner overlay for text
const BannerOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(3),
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  zIndex: 1,
}))

const HeroSection = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Box px={{ xs: 2, md: 15 }} py={2} mt={2}>
      <Paper elevation={1} sx={{ overflow: "hidden", borderRadius: 1 }}>
        {/* Single continuous banner with two sections side by side */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
          }}
        >
          {/* Cashback Banner */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRight: { md: "1px solid #f0f0f0" },
              borderBottom: { xs: "1px solid #f0f0f0", md: "none" },
              position: "relative",
            }}
          >
            <img
              src={banner || "/placeholder.svg"}
              alt="Cashback Offer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <BannerOverlay>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="h2"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  mb: 1,
                  fontSize: { xs: "1.4rem", md: "1.8rem" }, // Increased font size
                }}
              >
                Earn 5% Cashback
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  mb: 2,
                  fontSize: { xs: "1rem", md: "1.1rem" }, // Increased font size
                }}
              >
                On all purchases. Shop now and save!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="medium" // Changed from small to medium
                startIcon={<LocalAtm />}
                onClick={() => navigate("/products")}
                sx={{
                  maxWidth: "150px",
                  fontSize: "0.95rem", // Increased font size
                  py: 1, // Added padding
                }}
              >
                Shop & Earn
              </Button>
            </BannerOverlay>
          </Box>

          {/* Bulk Pricing Banner */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <img
              src={banner || "/placeholder.svg"}
              alt="Bulk Pricing"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <BannerOverlay>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="h2"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  mb: 1,
                  fontSize: { xs: "1.4rem", md: "1.8rem" }, // Increased font size
                }}
              >
                Save 30% on Bulk Orders
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  mb: 2,
                  fontSize: { xs: "1rem", md: "1.1rem" }, // Increased font size
                }}
              >
                Special cashback on orders of 10+ items.
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="medium" // Changed from small to medium
                startIcon={<Groups />}
                onClick={() => navigate("/bulk-pricing")}
                sx={{
                  maxWidth: "150px",
                  fontSize: "0.95rem", // Increased font size
                  py: 1, // Added padding
                }}
              >
                View Bulk Deals
              </Button>
            </BannerOverlay>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default HeroSection
