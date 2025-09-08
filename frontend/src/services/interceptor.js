import axios from "axios"

// Create axios instance with better error handling
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 120000, // Increased timeout for Render cold starts
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Debug logging for tracking requests
    const stack = new Error().stack
      ?.split("\n")
      .slice(2, 6) // skip first two lines (Error + this function)
      .join("\n")

    console.groupCollapsed(
      `%cAPI Request → ${config.method?.toUpperCase()} ${config.url}`,
      "color: #4caf50; font-weight: bold;",
    )
    console.log("Called from stack trace:\n", stack)
    console.log("Full URL:", `${config.baseURL}${config.url}`)
    console.log("Params:", config.params || {})
    console.log("Data:", config.data || {})
    console.groupEnd()

    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message)
      return Promise.reject(new Error("Network connection failed. Please check your internet connection."))
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded, waiting before retry...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return api(originalRequest)
    }

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await api.post("/auth/refresh-token")
        const { token } = response.data
        localStorage.setItem("token", token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // Don't redirect immediately, let the component handle it
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh-token"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.patch(`/auth/reset-password/${token}`, { password }),
  updatePassword: (passwords) => api.patch("/auth/update-password", passwords),
  update_password: (passwords) => api.patch("/auth/update-password", passwords), // Alias for consistency
}

// Export auth_api as alias for backward compatibility
export const auth_api = authAPI

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getTopProducts: (params) => api.get("/products/top", { params }),
  create: (productData) => {
    console.log("[v0] Original productData received:", productData)

    const isAlreadyTransformed = productData.hasOwnProperty("product_name")

    let transformedData

    if (isAlreadyTransformed) {
      // Data is already in correct backend format from NewItemForm
      transformedData = { ...productData }
      console.log("[v0] Data already in backend format, using as-is")
    } else {
      // Transform from old frontend format for backward compatibility
      transformedData = {
        product_name: productData.productName?.trim(),
        product_code: productData.productCode?.trim(),
        description: productData.description?.trim(),
        longer_description: productData.longerDescription?.trim(),
        category_name: productData.category?.trim(),
        subcategory_name: productData.subCategory?.trim(),
        cost_price: Number.parseFloat(productData.costPrice) || 0,
        vat_rate: Number.parseFloat(productData.vat) || 16,
        cashback_rate: Number.parseFloat(productData.cashbackRate) || 0,
        product_barcode: productData.productBarcode || null,
        etims_ref_code: productData.etimsRefCode || null,
        expiry_date: productData.expiryDate || null,
        image_url: productData.imageUrl || null,
        pricing_tiers: [
          {
            tier: 1,
            min_qty: Number.parseInt(productData.qty1Min) || 1,
            max_qty: Number.parseInt(productData.qty1Max) || 3,
            selling_price: Number.parseFloat(productData.sellingPrice1) || 0,
          },
          ...(productData.sellingPrice2
            ? [
                {
                  tier: 2,
                  min_qty: Number.parseInt(productData.qty2Min) || 4,
                  max_qty: Number.parseInt(productData.qty2Max) || 11,
                  selling_price: Number.parseFloat(productData.sellingPrice2),
                },
              ]
            : []),
          ...(productData.sellingPrice3
            ? [
                {
                  tier: 3,
                  min_qty: Number.parseInt(productData.qty3Min) || 12,
                  max_qty: null,
                  selling_price: Number.parseFloat(productData.sellingPrice3),
                },
              ]
            : []),
        ].filter((tier) => tier.selling_price > 0),
      }
      console.log("[v0] Transformed data from old format")
    }

    const requiredFields = ["product_name", "product_code", "category_name", "cost_price"]
    const missingFields = requiredFields.filter((field) => !transformedData[field] || transformedData[field] === "")

    console.log("[v0] Final transformed data for API:", transformedData)
    console.log("[v0] Missing required fields:", missingFields)

    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(", ")}`)
      console.error("[v0] Validation failed:", error.message)
      return Promise.reject(error)
    }

    if (transformedData.cost_price <= 0) {
      const error = new Error("Cost price must be greater than 0")
      console.error("[v0] Cost price validation failed:", transformedData.cost_price)
      return Promise.reject(error)
    }

    console.log("[v0] Sending POST request to /products with data:", transformedData)
    return api.post("/products", transformedData)
  },
  update: (id, productData) => {
    const transformedData = {
      product_name: productData.productName,
      description: productData.description,
      longer_description: productData.longerDescription,
      category_name: productData.category,
      subcategory_name: productData.subCategory,
      cost_price: productData.costPrice ? Number.parseFloat(productData.costPrice) : undefined,
      vat_rate: productData.vat ? Number.parseFloat(productData.vat) : undefined,
      cashback_rate: productData.cashbackRate ? Number.parseFloat(productData.cashbackRate) : undefined,
      image_url: productData.imageUrl,
      is_active: productData.isActive,
    }

    // Remove undefined values
    Object.keys(transformedData).forEach((key) => {
      if (transformedData[key] === undefined) {
        delete transformedData[key]
      }
    })

    return api.put(`/products/${id}`, transformedData)
  },
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stockData) => api.patch(`/products/${id}/stock`, stockData),
  getPricing: (id, quantity) => api.get(`/products/${id}/pricing/${quantity}`),
}

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get("/categories", { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
  createSubcategory: (subcategoryData) => api.post("/categories/subcategories", subcategoryData),
  updateSubcategory: (id, subcategoryData) => api.put(`/categories/subcategories/${id}`, subcategoryData),
  deleteSubcategory: (id) => api.delete(`/categories/subcategories/${id}`),
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post("/orders", orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  get_invoice: (orderId) =>
    api.get(`/orders/${orderId}/invoice`, {
      responseType: "blob", // Important for PDF downloads
    }),
  getInvoice: (orderId) =>
    api.get(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    }),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (userData) => api.put("/users/profile", userData),
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  registerCustomer: (userData) => api.post("/users/register-customer", userData),
  deactivateUser: (id, reasonData) => api.patch(`/users/${id}/deactivate`, reasonData),
  reactivateUser: (id) => api.patch(`/users/${id}/reactivate`),
  deleteAccount: (confirmationData) => api.delete("/users/account", { data: confirmationData }),
}

// Wallet API
export const walletAPI = {
  getBalance: () => api.get("/wallet/balance"),
  getTransactions: (params) => api.get("/wallet/transactions", { params }),
  withdraw: (withdrawalData) => api.post("/wallet/withdraw", withdrawalData),
}

// Payments API
export const paymentsAPI = {
  initiate: (paymentData) => api.post("/payments/initiate", paymentData),
  verify: (transactionId) => api.get(`/payments/verify/${transactionId}`),
  getHistory: (params) => api.get("/payments/history", { params }),
}

// Suppliers API
export const suppliersAPI = {
  getAll: (params) => api.get("/suppliers", { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post("/suppliers", supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

// Sales Agents API
export const salesAgentsAPI = {
  getAll: (params) => api.get("/sales-agents", { params }),
  getById: (id) => api.get(`/sales-agents/${id}`),
  getCommissions: (params) => api.get("/sales-agents/commissions", { params }),
  getCustomers: (params) => api.get("/sales-agents/customers", { params }),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard-stats"),
  getDashboardMetrics: () => api.get("/admin/dashboard"), // Fixed method name to match backend endpoint
  getRecentOrders: () => api.get("/admin/recent-orders"),
  getTopProducts: () => api.get("/admin/top-products"), // Added missing getTopProducts method
  getCustomerAcquisition: () => api.get("/admin/customer-acquisition"), // Added Customer Acquisition API method
  getSalesByCategory: () => api.get("/admin/sales-by-category"), // Added Sales by Category API method
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  getSystemSettings: () => api.get("/admin/settings"),
  updateSystemSettings: (settings) => api.put("/admin/settings", settings),
  getSalesAgents: (params) => api.get("/admin/sales-agents", { params }), // Added sales agents management methods
  createSalesAgent: (agentData) => api.post("/admin/sales-agents", agentData),
  deleteSalesAgent: (id) => api.delete(`/admin/sales-agents/${id}`),
  updateSalesAgent: (id, agentData) => api.put(`/admin/sales-agents/${id}`, agentData),
  updateSalesAgentStatus: (id, status) => api.patch(`/admin/sales-agents/${id}/status`, { status }),
  getSuppliers: (params) => api.get("/admin/suppliers", { params }),
  createSupplier: (supplierData) => api.post("/admin/suppliers", supplierData),
  updateSupplier: (id, supplierData) => api.put(`/admin/suppliers/${id}`, supplierData),
  deleteSupplier: (id) => api.delete(`/admin/suppliers/${id}`),
  updateSupplierStatus: (id, status) => api.patch(`/admin/suppliers/${id}/status`, { status }),
  validateSupplierEmail: (email, excludeId) => api.get("/admin/suppliers/validate-email", { params: { email, excludeId } }),
  // Purchase Orders
  getPurchaseOrders: (params) => api.get("/admin/purchase-orders", { params }),
  createPurchaseOrder: (poData, consumeVirtualStock = true) =>
    api.post("/admin/purchase-orders", { ...poData, consume_virtual_stock: consumeVirtualStock }),
  updatePurchaseOrder: (id, poData) => api.put(`/admin/purchase-orders/${id}`, poData),
  updatePurchaseOrderStatus: (id, status) => api.patch(`/admin/purchase-orders/${id}/status`, { status }),
  deletePurchaseOrder: (id) => api.delete(`/admin/purchase-orders/${id}`),
  // GRNs
  getGRNs: (params) => api.get("/admin/grns", { params }),
  createGRN: (grnData) => api.post("/admin/grns", grnData),
  updateGRN: (id, grnData) => api.put(`/admin/grns/${id}`, grnData),
  getCustomers: (params) => api.get("/admin/customers", { params }),
  updateCustomer: (id, customerData) => api.put(`/admin/customers/${id}`, customerData),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  createProduct: (productData) => productsAPI.create(productData), // Added createProduct method to adminAPI for NewItemForm compatibility
}

// File Upload API
export const uploadAPI = {
  uploadFile: (file, type = "general") => {
    const formData = new FormData()
    formData.append("image", file) // ✅ Backend expects 'image' field
    return api.post(`/upload/image/${type}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  uploadProductImage: (formData) => {
    return api.post("/upload/product-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  uploadMultipleProductImages: (formData) => {
    return api.post("/upload/product-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  deleteProductImage: (imageId) => {
    return api.delete(`/upload/product-images/${imageId}`)
  },

  uploadMultiple: (files, type = "general") => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    formData.append("type", type)
    return api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  deleteFile: (fileName, type = "profiles") => {
    return api.delete(`/upload/image/${type}/${fileName}`)
  },

  removeProfilePicture: () => {
    return api.delete("/upload/profile-picture")
  },
}

// Content Management API
export const cmsAPI = {
  // Homepage content
  getHomepageContent: () => api.get("/cms/homepage"),
  updateHomepageContent: (content) => api.put("/cms/homepage", content),

  // Navigation menus
  getNavigationMenus: () => api.get("/cms/navigation"),
  updateNavigationMenus: (menus) => api.put("/cms/navigation", menus),

  // Featured content
  getFeaturedProducts: (params) => api.get("/cms/featured-products", { params }),
  setFeaturedProducts: (productIds) => api.post("/cms/featured-products", { productIds }),

  // Banners and promotions
  getBanners: (location) => api.get(`/cms/banners/${location}`),
  createBanner: (bannerData) => api.post("/cms/banners", bannerData),
  updateBanner: (id, bannerData) => api.put(`/cms/banners/${id}`, bannerData),
  deleteBanner: (id) => api.delete(`/cms/banners/${id}`),

  // Site settings
  getSiteSettings: () => api.get("/cms/settings"),
  updateSiteSettings: (settings) => api.put("/cms/settings", settings),
}

// Enhanced Products API with CMS integration
productsAPI.getFeatured = (params) => api.get("/products/featured", { params })
productsAPI.getByCategory = (categoryId, params) => api.get(`/products/category/${categoryId}`, { params })
productsAPI.search = (query, params) => api.get("/products/search", { params: { q: query, ...params } })
productsAPI.getRecommended = (productId) => api.get(`/products/${productId}/recommended`)

// Media Management API
export const mediaAPI = {
  getImages: (params) => api.get("/media/images", { params }),
  uploadImage: (file, metadata) => {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("metadata", JSON.stringify(metadata))
    return api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  deleteImage: (id) => api.delete(`/media/images/${id}`),
  optimizeImage: (id, options) => api.post(`/media/images/${id}/optimize`, options),
}

export default api
