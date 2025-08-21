/**
 * Application-wide configuration settings
 * Centralizes all configurable values and placeholders
 */
export const appConfig = {
  // API configuration
  api: {
    baseUrl:
      import.meta.env.VITE_API_URL ||
      (import.meta.env.MODE === "production"
        ? "https://firstcraft-backend-q68n.onrender.com/api" // Replace with your actual Render backend URL
        : "http://localhost:3000/api"),
    timeout: 15000, // 15 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Placeholder images
  placeholders: {
    defaultImage: "/placeholder.svg",
    productImage: "/placeholder.svg",
    categoryImage: "/placeholder.svg",
    userImage: "/placeholder.svg",
    bannerImage: "/placeholder.svg",
    logoImage: "/placeholder.svg",
  },

  // Default values
  defaults: {
    pageSize: 10,
    currency: "KES",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },

  // Feature flags
  features: {
    enableCart: true,
    enableWishlist: true,
    enableReviews: true,
    enableComparisons: false,
  },

  // UI settings
  ui: {
    theme: "light",
    animationsEnabled: true,
    toastDuration: 3000,
    modalTransitionDuration: 300,
  },

  // Error messages
  errorMessages: {
    general: "Something went wrong. Please try again later.",
    network: "Network error. Please check your connection.",
    notFound: "The requested resource was not found.",
    unauthorized: "You are not authorized to access this resource.",
    validation: "Please check your input and try again.",
  },
}

/**
 * Environment-specific configuration overrides
 */
const envSpecificConfig = {
  development: {
    api: {
      timeout: 30000, // 30 seconds in development for debugging
    },
    features: {
      enableDebugTools: true,
    },
  },
  production: {
    features: {
      enableDebugTools: false,
    },
  },
  test: {
    api: {
      mockResponses: true,
    },
  },
}

// Determine current environment
const currentEnv = import.meta.env.MODE || "development"

// Merge environment-specific config with base config
if (envSpecificConfig[currentEnv]) {
  Object.keys(envSpecificConfig[currentEnv]).forEach((key) => {
    appConfig[key] = {
      ...appConfig[key],
      ...envSpecificConfig[currentEnv][key],
    }
  })
}

export default appConfig
