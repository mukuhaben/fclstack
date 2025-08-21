import express from "express"
import authRoutes from "./auth.js"
import userRoutes from "./users.js"
import productRoutes from "./products.js"
import categoryRoutes from "./categories.js"
import cartRoutes from "./cart.js"
import orderRoutes from "./orders.js"
import adminRoutes from "./admin.js"
import salesAgentRoutes from "./sales-agent.js"
import uploadRoutes from "./upload.js"
import walletRoutes from "./wallet.js"

const router = express.Router()

// Mount all routes with their prefixes
router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/products", productRoutes)
router.use("/categories", categoryRoutes)
router.use("/cart", cartRoutes)
router.use("/orders", orderRoutes)
router.use("/admin", adminRoutes)
router.use("/sales-agent", salesAgentRoutes)
router.use("/upload", uploadRoutes)
router.use("/wallet", walletRoutes)

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.json({
    success: true,
    endpoints: {
      auth: [
        "POST /api/auth/login",
        "POST /api/auth/register",
        "GET /api/auth/profile",
        "PUT /api/auth/profile",
        "POST /api/auth/change-password",
      ],
      products: [
        "GET /api/products",
        "POST /api/products",
        "GET /api/products/:id",
        "PUT /api/products/:id",
        "DELETE /api/products/:id",
      ],
      categories: [
        "GET /api/categories",
        "POST /api/categories",
        "GET /api/categories/:id",
        "PUT /api/categories/:id",
        "DELETE /api/categories/:id",
      ],
      admin: [
        "GET /api/admin/dashboard",
        "GET /api/admin/orders",
        "PUT /api/admin/orders/:id",
        "GET /api/admin/inventory",
        "GET /api/admin/reports/sales",
      ],
      salesAgent: [
        "GET /api/sales-agent/dashboard",
        "GET /api/sales-agent/customers",
        "GET /api/sales-agent/orders",
        "GET /api/sales-agent/commissions",
      ],
    },
  })
})

export default router
