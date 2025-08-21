import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,   // your production frontend (from env)
  "http://localhost:3000",    // backend testing
  "http://localhost:5173"     // Vite/React local frontend
].filter(Boolean); // removes undefined/null

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// API Routes
import authRoutes from "./src/routes/auth.js"
import userRoutes from "./src/routes/users.js"
import productRoutes from "./src/routes/products.js"
import categoryRoutes from "./src/routes/categories.js"
import cartRoutes from "./src/routes/cart.js"
import orderRoutes from "./src/routes/orders.js"
import adminRoutes from "./src/routes/admin.js"
import salesAgentRoutes from "./src/routes/sales-agent.js"
import uploadRoutes from "./src/routes/upload.js"

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/sales-agent", salesAgentRoutes)
app.use("/api/upload", uploadRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})
