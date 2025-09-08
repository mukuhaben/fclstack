"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productsAPI } from "../../services/interceptor.js"

const ProductDetails = () => {
  const params = useParams()
  const productId = params.id || params.productId  // ✅ Support both cases
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID found in route")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const response = await productsAPI.getById(productId)
        if (response.data?.success) {
          const productData = response.data.data
          setProduct(productData)
          if (productData.variants?.length > 0) {
            setSelectedVariant(productData.variants[0])
          }
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
          setIsWishlisted(wishlist.some((item) => item.id === productData.id))
        } else {
          setError("Product not found")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getProductImages = () => {
    const images = []
    
    // Add main product image first
    if (product?.image_url || product?.imageUrl || product?.primaryImage) {
      const mainImage = product.image_url || product.imageUrl || product.primaryImage
      const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "")
      const fullImageUrl = mainImage.startsWith("/uploads") ? `${apiBase}${mainImage}` : mainImage
      images.push(fullImageUrl)
    }
    
    // Add additional images from product.images array
    if (product?.images?.length > 0) {
      const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "")
      images.push(...product.images.map((img) => {
        const imageUrl = img.url || img.image_url
        return imageUrl.startsWith("/uploads") ? `${apiBase}${imageUrl}` : imageUrl
      }))
    }
    
    // Add variant image if selected
    if (selectedVariant?.image) {
      images.unshift(selectedVariant.image)
    }
    
    return images
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">{error}</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        ⚠️ Product not loaded
      </div>
    )
  }

  const images = getProductImages()

  return (
    <div className="min-h-screen bg-background">
      {/* Inline theme styles */}
      <style>{`
        :root {
          --background: #ffffff;
          --foreground: #475569;
          --card: #f1f5f9;
          --card-foreground: #475569;
          --popover: #ffffff;
          --popover-foreground: #475569;
          --primary: #059669;
          --primary-foreground: #ffffff;
          --secondary: #10b981;
          --secondary-foreground: #ffffff;
          --muted: #f1f5f9;
          --muted-foreground: #4b5563;
          --accent: #10b981;
          --accent-foreground: #ffffff;
          --destructive: #ea580c;
          --destructive-foreground: #ffffff;
          --border: #e5e7eb;
          --input: #f1f5f9;
          --ring: rgba(9, 150, 105, 0.5);
        }
        body {
          background: var(--background);
          color: var(--foreground);
        }
        .bg-background { background-color: var(--background); }
        .bg-card { background-color: var(--card); }
        .bg-muted { background-color: var(--muted); }
        .bg-primary { background-color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .bg-accent { background-color: var(--accent); }
        .bg-destructive { background-color: var(--destructive); }
        .text-foreground { color: var(--foreground); }
        .text-muted-foreground { color: var(--muted-foreground); }
        .text-primary { color: var(--primary); }
        .text-primary-foreground { color: var(--primary-foreground); }
        .text-secondary-foreground { color: var(--secondary-foreground); }
        .text-accent-foreground { color: var(--accent-foreground); }
        .text-destructive { color: var(--destructive); }
        .text-destructive-foreground { color: var(--destructive-foreground); }
        .border { border: 1px solid var(--border); }
        .border-border { border-color: var(--border); }
        .border-primary { border-color: var(--primary); }
        .border-destructive { border-color: var(--destructive); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-primary ring-2 ring-primary"
                      : "border-border"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{product.brand}</p>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.discountPrice && (
                <p className="text-lg line-through text-muted-foreground">
                  {formatPrice(product.discountPrice)}
                </p>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border border-border rounded-lg"
              >
                -
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 border border-border rounded-lg"
              >
                +
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-border rounded-xl hover:border-primary transition-colors">
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
