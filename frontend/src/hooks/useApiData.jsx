"use client"

import { useState, useEffect, useCallback } from "react"
import { productsAPI, categoriesAPI, cmsAPI } from "../services/interceptor.js"

// Custom hook for data fetching with error handling
export const useApiData = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data")
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for products with caching
export const useProducts = (params = {}) => {
  return useApiData(() => productsAPI.getAll(params), [JSON.stringify(params)])
}

// Hook for categories
export const useCategories = () => {
  return useApiData(() => categoriesAPI.getAll())
}

// Hook for featured products
export const useFeaturedProducts = (section) => {
  return useApiData(() => cmsAPI.getFeaturedProducts({ section }), [section])
}

// Hook for CMS content
export const useCMSContent = (contentType) => {
  return useApiData(() => cmsAPI.getHomepageContent(), [contentType])
}

// CHANGE: Updated navigation menus hook to use categories API
// This ensures we get the actual category structure from the backend
export const useNavigationMenus = () => {
  return useApiData(() => categoriesAPI.getAll(), [])
}

// CHANGE: Add new hook for category-based navigation
// This hook specifically formats categories for navigation purposes
export const useCategoryNavigation = () => {
  const [navigationData, setNavigationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategoryNavigation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoriesAPI.getAll()

      let categories = []
      if (response.data?.data?.categories) {
        categories = response.data.data.categories
      } else if (response.data?.categories) {
        categories = response.data.categories
      } else if (Array.isArray(response.data)) {
        categories = response.data
      }

      const processedData = {
        categories: categories.filter((cat) => cat.isActive !== false), // Only include active categories
        timestamp: Date.now(),
      }

      setNavigationData(processedData)
      console.log("Navigation data loaded:", processedData.categories.length, "categories")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch navigation data")
      console.error("Navigation API Error:", err)

      setNavigationData({
        categories: [
          {
            id: 1,
            name: "Office Supplies",
            subCategories: [
              { id: 1, name: "Stationery" },
              { id: 2, name: "Filing" },
              { id: 3, name: "Writing Instruments" },
            ],
          },
          {
            id: 2,
            name: "Technology",
            subCategories: [
              { id: 4, name: "Computers" },
              { id: 5, name: "Accessories" },
            ],
          },
        ],
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategoryNavigation()
  }, [fetchCategoryNavigation])

  return { data: navigationData, loading, error, refetch: fetchCategoryNavigation }
}
