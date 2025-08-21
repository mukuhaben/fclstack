import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import HeroSection from "../HeroSection";
import ProductCategories from "../ProductCategories";
import SupplierQuoteRequest from "../SupplierQuoteRequest";
import NewsletterSubscription from "../../../components/NewsLetter";

function HomePage() {
  // Add error handling state
  const [apiError, setApiError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Add error handling for API calls
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Simple health check to verify backend connectivity
        const response = await fetch(`${import.meta.env.VITE_API_URL }/products?limit=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        })
        
        if (response.ok) {
          setApiError(false)
        } else {
          console.warn('API health check returned non-200 status:', response.status)
          setApiError(true)
        }
      } catch (error) {
        console.warn('API health check failed:', error.message)
        setApiError(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkApiHealth()
  }, [])

  // Add fallback content rendering logic
  const renderFallbackContent = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box sx={{ 
        backgroundColor: '#fefce8', 
        border: '1px solid #fde047', 
        borderRadius: 2, 
        p: 6, 
        maxWidth: 'md', 
        mx: 'auto' 
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 600, 
          color: '#92400e', 
          marginBottom: '0.5rem' 
        }}>
          Service Temporarily Unavailable
        </h3>
        <p style={{ 
          color: '#a16207', 
          marginBottom: '1rem' 
        }}>
          We're experiencing high traffic. Please try refreshing the page in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#ca8a04',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#a16207'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ca8a04'}
        >
          Refresh Page
        </button>
      </Box>
    </Box>
  )

  // Show loading state briefly
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <p>Loading...</p>
      </Box>
    )
  }

  // Show fallback if API is down
  if (apiError) {
    return (
      <Box>
        <HeroSection />
        {renderFallbackContent()}
        <NewsletterSubscription />
      </Box>
    )
  }

  // Render normal content when API is working
  return (
    <Box>
      <HeroSection />
      <ProductCategories />
      <NewsletterSubscription />
    </Box>
  );
}

export default HomePage;