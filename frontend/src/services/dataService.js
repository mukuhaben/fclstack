import { cmsAPI, productsAPI, categoriesAPI } from "./api"

class DataService {
  constructor() {
    this.cache = new Map()
    this.cacheDuration = 5 * 60 * 1000 // 5 minutes
  }

  async getCachedData(key, fetcher, options = {}) {
    const { forceRefresh = false, cacheDuration = this.cacheDuration } = options

    const cached = this.cache.get(key)
    if (cached && !forceRefresh && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data
    }

    try {
      const data = await fetcher()
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      })
      return data
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.warn("Using expired cache due to fetch error:", error)
        return cached.data
      }
      throw error
    }
  }

  async getProducts(params = {}) {
    const key = `products_${JSON.stringify(params)}`
    return this.getCachedData(key, () => productsAPI.getAll(params))
  }

  // CHANGE: Enhanced categories method with better error handling
  async getCategories() {
    return this.getCachedData("categories", async () => {
      try {
        const response = await categoriesAPI.getAll()
        // Handle different response structures from the API
        return {
          categories: response.data?.data?.categories || response.data?.categories || [],
          success: true,
          timestamp: Date.now(),
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        throw new Error("Unable to load categories. Please try again.")
      }
    })
  }

  async getHomepageContent() {
    return this.getCachedData("homepage", () => cmsAPI.getHomepageContent())
  }

  // CHANGE: Updated navigation menus to use categories API
  async getNavigationMenus() {
    return this.getCachedData("navigation", async () => {
      try {
        const categoriesData = await this.getCategories()
        return {
          categories: categoriesData.categories,
          menus: this.processNavigationMenus(categoriesData.categories),
          success: true,
        }
      } catch (error) {
        console.error("Failed to fetch navigation menus:", error)
        return {
          categories: [],
          menus: {},
          success: false,
          error: error.message,
        }
      }
    })
  }

  // CHANGE: New method to process categories into navigation menu structure
  processNavigationMenus(categories) {
    if (!categories || categories.length === 0) return {}

    const processedMenus = {}

    categories.forEach((category) => {
      if (category.subCategories && category.subCategories.length > 0) {
        // Use main category as menu title and subcategories as menu items
        processedMenus[category.name] = category.subCategories.map((sub) => sub.name)
      } else {
        // If no subcategories, create a single-item menu
        processedMenus[category.name] = [category.name]
      }
    })

    return processedMenus
  }

  async getFeaturedProducts(section) {
    const key = `featured_${section}`
    return this.getCachedData(key, () => cmsAPI.getFeaturedProducts({ section }))
  }

  clearCache(key) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // CHANGE: Enhanced preload method with better error handling
  async preloadCriticalData() {
    try {
      const promises = [
        this.getCategories().catch((err) => console.warn("Failed to preload categories:", err)),
        this.getNavigationMenus().catch((err) => console.warn("Failed to preload navigation:", err)),
        this.getFeaturedProducts("homepage").catch((err) => console.warn("Failed to preload featured products:", err)),
      ]

      await Promise.allSettled(promises)
      console.log("Critical data preloading completed")
    } catch (error) {
      console.warn("Failed to preload some critical data:", error)
    }
  }
}

export const dataService = new DataService()
export default dataService
