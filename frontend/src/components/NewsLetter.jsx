import { useState } from "react"
import { Box, Typography, TextField, Button, Paper, Container, Grid, useTheme } from "@mui/material"

const NewsletterSubscription = () => {
  const theme = useTheme()
  const [email, setEmail] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Subscribed with email:", email)
    setEmail("")
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        py: 8,
        width: "100%",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "transparent",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: "bold",
              mb: 2,
              fontSize: "1.5rem",
              color: "text.primary",
            }}
          >
            Subscribe to our newsletter
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
              fontSize: "1.1rem", // Increased font size
            }}
          >
            Get daily news on upcoming offers from many suppliers all over the world
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  fullWidth
                  placeholder="Email"
                  variant="outlined"
                  size="small"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : "#fff",
                      borderRadius: "4px",
                      fontSize: "1rem", // Increased font size
                    },
                  }}
                  InputProps={{
                    style: {
                      height: "48px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    height: "48px",
                    textTransform: "none",
                    fontWeight: "medium",
                    fontSize: "1rem", // Increased font size
                  }}
                >
                  Subscribe
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default NewsletterSubscription
