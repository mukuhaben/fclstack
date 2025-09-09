import { getPublicUrlFromKey, getDefaultImageUrl } from "../config/gcs.js"

export function resolvePublicUrl(possibleKeyOrUrl, type = "products") {
  if (!possibleKeyOrUrl) return getDefaultImageUrl(type)
  const isFullUrl = typeof possibleKeyOrUrl === "string" && /^(https?:)?\/\//i.test(possibleKeyOrUrl)
  if (isFullUrl) return possibleKeyOrUrl
  const publicUrl = getPublicUrlFromKey(possibleKeyOrUrl)
  return publicUrl || getDefaultImageUrl(type)
}

export function resolveArrayOfImageUrls(items) {
  if (!Array.isArray(items)) return []
  return items.map((u) => resolvePublicUrl(u))
}

