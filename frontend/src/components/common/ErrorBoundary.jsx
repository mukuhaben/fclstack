"use client"

import React from "react"
import { Box, Typography, Button, Alert } from "@mui/material"
import { RefreshRounded, HomeRounded } from "@mui/icons-material"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })

    // Log error to monitoring service
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={4}
          textAlign="center"
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Typography>
          </Alert>

          <Box display="flex" gap={2}>
            <Button variant="contained" startIcon={<RefreshRounded />} onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outlined" startIcon={<HomeRounded />} onClick={() => (window.location.href = "/")}>
              Go Home
            </Button>
          </Box>

          {process.env.NODE_ENV === "development" && (
            <Box mt={4} p={2} bgcolor="grey.100" borderRadius={1} maxWidth={800}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
