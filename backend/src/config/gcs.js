import { Storage } from "@google-cloud/storage"
import path from "path"

const {
  GCS_PROJECT_ID,
  GCS_BUCKET_NAME,
  GOOGLE_APPLICATION_CREDENTIALS,
  GCS_PUBLIC_BASE_URL,
  DEFAULT_AVATAR_URL,
  DEFAULT_PRODUCT_IMAGE_URL,
} = process.env

// Initialize Google Cloud Storage client
let storage
if (GOOGLE_APPLICATION_CREDENTIALS) {
  storage = new Storage({ projectId: GCS_PROJECT_ID || undefined, keyFilename: GOOGLE_APPLICATION_CREDENTIALS })
} else {
  storage = new Storage({ projectId: GCS_PROJECT_ID || undefined })
}

if (!GCS_BUCKET_NAME) {
  console.warn("[gcs] GCS_BUCKET_NAME is not set. Image uploads will fail until configured.")
}

const bucket = GCS_BUCKET_NAME ? storage.bucket(GCS_BUCKET_NAME) : null

export function getGcsBucket() {
  return bucket
}

export function getPublicBaseUrl() {
  // Allow override, otherwise use standard storage URL
  return GCS_PUBLIC_BASE_URL || (GCS_BUCKET_NAME ? `https://storage.googleapis.com/${GCS_BUCKET_NAME}` : "")
}

export function buildObjectKey({ type = "products", filename }) {
  const safeType = ["products", "profiles", "categories"].includes(type) ? type : "products"
  return `${safeType}/${filename}`
}

export function getPublicUrlFromKey(objectKey) {
  if (!objectKey) return null
  const base = getPublicBaseUrl()
  if (!base) return null
  return `${base}/${objectKey}`
}

export function getDefaultImageUrl(type = "products") {
  if (type === "profiles") return DEFAULT_AVATAR_URL || "https://via.placeholder.com/256?text=Avatar"
  return DEFAULT_PRODUCT_IMAGE_URL || "https://via.placeholder.com/512x512?text=No+Image"
}

export async function uploadBufferToGcs({ buffer, destination, contentType, makePublic = true, cacheControl = "public, max-age=31536000" }) {
  if (!bucket) throw new Error("GCS bucket not configured")
  const file = bucket.file(destination)
  await file.save(buffer, { resumable: false, contentType, public: makePublic, metadata: { cacheControl, contentType } })
  if (makePublic) {
    try {
      await file.makePublic()
    } catch {
      // ignore if already public
    }
  }
  const publicUrl = getPublicUrlFromKey(destination)
  return { objectKey: destination, publicUrl }
}

export async function deleteFromGcs(objectKey) {
  if (!bucket || !objectKey) return false
  try {
    await bucket.file(objectKey).delete({ ignoreNotFound: true })
    return true
  } catch (err) {
    console.error("[gcs] delete error", err.message)
    return false
  }
}

export function generateUniqueFilename(originalName) {
  const timestamp = Date.now()
  const randomSuffix = Math.round(Math.random() * 1e9)
  const ext = path.extname(originalName) || ""
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "-")
  return `${base}-${timestamp}-${randomSuffix}${ext}`
}

