{/*
import { useState, useEffect } from "react"
import { Box, Typography, Grid, Paper, Stack, Card, CardMedia, CardContent } from "@mui/material"

// Import images - replace these with your actual image imports
import smartWatchImage from "../../assets/images/8.png"
import laptopImage from "../../assets/images/7.png"
import goProImage from "../../assets/images/3.png"
import headphonesImage from "../../assets/images/5.png"
import canonImage from "../../assets/images/6.png"

// Helper function to format numbers with commas
const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const DealsAndOffers = () => {
  // Initial countdown values
  const [countdown, setCountdown] = useState({
    days: 4,
    hours: 13,
    minutes: 34,
    seconds: 56,
  })

  // Products data
  const products = [
    {
      id: 1,
      name: "Smart watches",
      cashback: 25,
      image: smartWatchImage,
    },
    {
      id: 2,
      name: "Laptops",
      cashback: 15,
      image: laptopImage,
    },
    {
      id: 3,
      name: "GoPro cameras",
      cashback: 40,
      image: goProImage,
    },
    {
      id: 4,
      name: "Headphones",
      cashback: 25,
      image: headphonesImage,
    },
    {
      id: 5,
      name: "Canon cameras",
      cashback: 25,
      image: canonImage,
    },
  ]

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        let { days, hours, minutes, seconds } = prevCountdown

        if (seconds > 0) {
          seconds -= 1
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes -= 1
          } else {
            minutes = 59
            if (hours > 0) {
              hours -= 1
            } else {
              hours = 23
              if (days > 0) {
                days -= 1
              }
            }
          }
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // CountdownBox component for displaying time units
  const CountdownBox = ({ value, label }) => (
    <Box
      sx={{
        width: 45,
        height: 50,
        bgcolor: "#505050",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 1,
        py: 0.5,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {value < 10 ? `0${value}` : value}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
        {label}
      </Typography>
    </Box>
  )

  // ProductCard component
  const ProductCard = ({ product }) => (
    <Card
      sx={{
        maxWidth: 180,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxShadow: "none",
        border: "1px solid #f0f0f0",
        py: 2,
        position: "relative", // Added for absolute positioning of cashback badge
      }}
    >
      {/* Cashback Badge - Styled to match ProductCategories 
      <Typography
        variant="body2"
        color="white"
        fontWeight="bold"
        sx={{
          position: "absolute",
          top: 5,
          left: 5,
          backgroundColor: "red",
          borderRadius: 1,
          px: 1,
          py: 0.3,
          fontSize: "0.75rem", // Smaller font size for smaller cards
          fontWeight: 700,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: 1,
        }}
      >
        {product.cashback}% Cashback
      </Typography>

      <CardMedia
        component="img"
        image={product.image}
        alt={product.name}
        sx={{
          width: "auto",
          height: 100,
          objectFit: "contain",
          mb: 1,
          mt: 2, // Reduced margin-top from 3 to 2
        }}
      />
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Typography variant="body2" gutterBottom sx={{ fontSize: "0.95rem" }}>
          {product.name}
        </Typography>
      </CardContent>
    </Card>
  )

  return (
    <Box paddingX={10} paddingY={2}>
      <Paper elevation={1} sx={{ overflow: "hidden", borderRadius: 1 }}>
        <Grid container spacing={1} alignItems="stretch" gap={5} justifyContent={"center"}>
          {/* Left section with title and countdown 
          <Grid
            item
            xs={12} // Full width on extra-small screens, stacks above products
            md={2} // Takes 2 of 12 columns on medium screens and up
            sx={{
              borderRight: { xs: "none", md: "1px solid #e0e0e0" }, // Keep original border style
              p: 3, // Keep original padding
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: "1.2rem" }}>
              Deals and offers
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: "0.95rem" }}>
              Hygiene equipments
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <CountdownBox value={countdown.days} label="Days" />
              <CountdownBox value={countdown.hours} label="Hour" />
              <CountdownBox value={countdown.minutes} label="Min" />
              <CountdownBox value={countdown.seconds} label="Sec" />
            </Stack>
          </Grid>

          {/* Product cards - mapped directly as items in the main container 
          {products.map((product) => (
            <Grid
              item
              xs={6} // 2 cards per row on extra-small screens
              sm={6} // 3 cards per row on small screens (results in 2 rows for 5 products)
              md={4} // 5 cards per row on medium screens (2 cols * 5 cards = 10 cols)
              key={product.id}
              sx={{
                display: "flex", // Allows ProductCard with height: '100%' to stretch
                justifyContent: "center", // Centers card if it's narrower than grid item (due to maxWidth)
              }}
            >
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export default DealsAndOffers

*/}
