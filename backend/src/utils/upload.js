import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure upload directories exist
const uploadDir = "public/uploads"
const productImagesDir = "public/uploads/products"
const profileImagesDir = "public/uploads/profiles"
const categoryImagesDir = "public/uploads/categories"
;[uploadDir, productImagesDir, profileImagesDir, categoryImagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Configure multer for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = productImagesDir

    if (req.body.type === "profile") {
      uploadPath = profileImagesDir
    } else if (req.body.type === "category") {
      uploadPath = categoryImagesDir
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

export function getImageUrl(filename, type = "products") {
  return `/uploads/${type}/${filename}`
}

export function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
  } catch (error) {
    console.error("Error deleting file:", error)
  }
  return false
}

// Helper function to validate image files
export function validateImageFile(file, maxSize = 5 * 1024 * 1024) {
  const errors = []

  if (!file) {
    errors.push("No file provided")
    return errors
  }

  if (!file.type || !file.type.startsWith("image/")) {
    errors.push("File must be an image")
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    errors.push("File type not supported. Please use JPEG, PNG, GIF, or WebP")
  }

  return errors
}

// Helper function to generate unique filename
export function generateUniqueFilename(originalName, prefix = "") {
  const timestamp = Date.now()
  const randomSuffix = Math.round(Math.random() * 1e9)
  const fileExtension = path.extname(originalName)
  const baseName = path.basename(originalName, fileExtension)

  return `${prefix}${prefix ? "-" : ""}${baseName}-${timestamp}-${randomSuffix}${fileExtension}`
}
