import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { query } from "../utils/database.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// POST /api/upload/product-images - Upload product images
router.post("/product-images", requireRole(["admin"]), upload.array("images", 5), async (req, res) => {
  try {
    const { productId } = req.body
    const files = req.files

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" })
    }

    // Check if product exists
    const productResult = await query("SELECT id FROM products WHERE id = $1", [productId])
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Check if this is the first image (make it primary)
    const existingImages = await query("SELECT COUNT(*) as count FROM product_images WHERE product_id = $1", [
      productId,
    ])
    const isFirstImage = Number.parseInt(existingImages.rows[0].count) === 0

    const uploadedImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const imageUrl = `/uploads/${file.filename}`
      const isPrimary = isFirstImage && i === 0

      if (isPrimary) {
        await query("UPDATE product_images SET is_primary = false WHERE product_id = $1", [productId])
      }

      const result = await query(
        "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING id, image_url, is_primary",
        [productId, imageUrl, isPrimary],
      )

      uploadedImages.push(result.rows[0])
    }

    res.json({
      success: true,
      images: uploadedImages,
      message: `${files.length} image(s) uploaded successfully`,
    })
  } catch (error) {
    console.error("Product image upload error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/upload/product-image - Upload product image
router.post("/product-image", requireRole(["admin"]), upload.single("image"), async (req, res) => {
  try {
    console.log("[v0] Product image upload request received")
    console.log("[v0] User from token:", req.user)
    console.log("[v0] File received:", req.file ? "Yes" : "No")

    if (!req.user) {
      console.log("[v0] No user found in request - authentication failed")
      return res.status(401).json({
        error: "Authentication required. Please log in as admin.",
        success: false,
      })
    }

    if (req.user.role !== "admin") {
      console.log("[v0] User role is not admin:", req.user.role)
      return res.status(403).json({
        error: "Admin access required. You must be signed in as admin to upload photo.",
        success: false,
        userRole: req.user.role,
      })
    }

    const file = req.file
    const { type = "product" } = req.body

    if (!file) {
      console.log("[v0] No file uploaded in request")
      return res.status(400).json({
        error: "No image uploaded",
        success: false,
      })
    }

    const imageUrl = `/uploads/${file.filename}`
    console.log("[v0] Image uploaded successfully:", imageUrl)

    res.json({
      success: true,
      imageUrl,
      filename: file.filename,
      message: "Product image uploaded successfully",
    })
  } catch (error) {
    console.error("[v0] Product image upload error:", error)
    res.status(500).json({
      error: "Internal server error",
      success: false,
      details: error.message,
    })
  }
})

// POST /api/upload/multiple-product-images - Upload multiple product images
router.post("/multiple-product-images", requireRole(["admin"]), upload.array("images", 5), async (req, res) => {
  try {
    if (!req.user) {
      console.log("[v0] No user found in request - authentication failed")
      return res.status(401).json({
        error: "Authentication required. Please log in as admin.",
        success: false,
      })
    }

    if (req.user.role !== "admin") {
      console.log("[v0] User role is not admin:", req.user.role)
      return res.status(403).json({
        error: "Admin access required. You must be signed in as admin to upload photos.",
        success: false,
        userRole: req.user.role,
      })
    }

    const files = req.files

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: "No images uploaded",
        success: false,
      })
    }

    const uploadedImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const imageUrl = `/uploads/${file.filename}`

      uploadedImages.push({
        id: `temp-${Date.now()}-${i}`,
        image_url: imageUrl,
        imageUrl: imageUrl, // Also provide camelCase version
        is_primary: i === 0,
        filename: file.filename,
      })
    }

    console.log("[v0] Multiple images uploaded successfully:", uploadedImages.length)

    res.json({
      success: true,
      images: uploadedImages,
      message: `${files.length} image(s) uploaded successfully`,
    })
  } catch (error) {
    console.error("Multiple product image upload error:", error)
    res.status(500).json({
      error: "Internal server error",
      success: false,
      details: error.message,
    })
  }
})

// POST /api/upload/profile-image - Upload profile image
router.post("/profile-image", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const userId = req.user.id
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" })
    }

    const imageUrl = `/uploads/${file.filename}`

    // Update user's profile image
    await query("UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [imageUrl, userId])

    res.json({
      success: true,
      imageUrl,
      message: "Profile image uploaded successfully",
    })
  } catch (error) {
    console.error("Profile image upload error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/upload/image/profiles - Upload profile picture
router.post("/image/profiles", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const userId = req.user.id
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: "No image uploaded" })
    }

    const filename = file.filename

    // Update user's profile image with just the filename
    await query("UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [filename, userId])

    res.json({
      success: true,
      data: {
        avatar_url: filename,
      },
      message: "Profile picture uploaded successfully",
    })
  } catch (error) {
    console.error("Profile image upload error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/upload/product-images/:id - Delete product image
router.delete("/product-images/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const result = await query("SELECT image_url, product_id, is_primary FROM product_images WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" })
    }

    const { image_url, product_id, is_primary } = result.rows[0]

    // Delete the image record
    await query("DELETE FROM product_images WHERE id = $1", [id])

    // Delete physical file
    const filePath = path.join(__dirname, "../../", image_url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    if (is_primary) {
      const remainingImages = await query(
        "SELECT id FROM product_images WHERE product_id = $1 ORDER BY created_at ASC LIMIT 1",
        [product_id],
      )

      if (remainingImages.rows.length > 0) {
        await query("UPDATE product_images SET is_primary = true WHERE id = $1", [remainingImages.rows[0].id])
      }
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Image deletion error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/upload/profile-picture - Remove profile picture
router.delete("/profile-picture", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Get current profile image
    const userResult = await query("SELECT profile_image FROM users WHERE id = $1", [userId])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const currentImage = userResult.rows[0].profile_image

    // Remove profile image from database
    await query("UPDATE users SET profile_image = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [userId])

    // Delete physical file if it exists
    if (currentImage) {
      const filePath = path.join(__dirname, "../../uploads", currentImage)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    res.json({
      success: true,
      message: "Profile picture removed successfully",
    })
  } catch (error) {
    console.error("Profile picture removal error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
