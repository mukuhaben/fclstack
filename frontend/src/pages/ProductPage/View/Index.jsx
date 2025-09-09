"use client"

import { useState, useEffect } from "react"
import { productsAPI } from "../../../services/interceptor.js" // Updated import path to use interceptor
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  IconButton,
  Chip,
  Stack,
} from "@mui/material"
import { ShoppingCart, Favorite, FavoriteBorder } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

const ProductPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [cart, setCart] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || []
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || []
    setWishlist(storedWishlist)
    setCart(storedCart)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("[v0] Fetching products for customer frontend...")

        const response = await productsAPI.getAll()
        console.log("[v0] Products API response:", response)

        if (response.data && response.data.success) {
          const productsData = response.data.data || []
          console.log("[v0] Products data:", productsData)

          const normalizedProducts = productsData.map((product) => ({
            ...product,
            id: product.id,
            name: product.name,
            description: product.description,
            image:
              product.image_url || product.primaryImage || product.imageUrl || `/placeholder.svg?height=200&width=200&query=product image`,
            price: product.price || 0,
            pricing_tiers: product.pricingTiers || [],
            category: product.category?.name,
            subcategory: product.subcategory?.name,
            stock: product.stockQuantity || 0,
            cashback_rate: product.cashbackRate || 0,
          }))

          setProducts(normalizedProducts)
        } else {
          console.error("[v0] Invalid response structure:", response)
          setError(response.data?.message || "Failed to fetch products")
        }
      } catch (err) {
        console.error("[v0] Fetch products error:", err)
        setError(err.message || "An error occurred while fetching products.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist.some((item) => item.id === product.id)
    let updatedWishlist

    if (isInWishlist) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id)
    } else {
      updatedWishlist = [...wishlist, product]
    }

    setWishlist(updatedWishlist)
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
  }

  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    let updatedCart

    if (existingItem) {
      updatedCart = cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }]
    }

    setCart(updatedCart)
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const renderPricingTiers = (pricingTiers) => {
    if (!pricingTiers || pricingTiers.length === 0) return null;
  
    const sortedTiers = [...pricingTiers].sort(
      (a, b) =>
        (a.min_quantity || a.minQuantity) - (b.min_quantity || b.minQuantity)
    );
  
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 0.5,
          mt: "auto",
        }}
      >
        {sortedTiers.map((tier, idx) => {
          const minQty = tier.min_quantity || tier.minQuantity;
          const maxQty = tier.max_quantity || tier.maxQuantity || "+";
          const price = tier.selling_price || tier.sellingPrice || 0;
  
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 0.5,
                textAlign: "center",
                fontSize: 10,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: 10, fontWeight: "bold" }}
              >
                {`${minQty}-${maxQty === 999 ? "+" : maxQty} pcs`}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 10 }}>
                {formatPrice(price)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };
  
  
  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (products.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">No data in database. Please add products from the admin panel.</Alert>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Our Products
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover our wide range of quality products with bulk pricing discounts
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{
                  objectFit: "cover",
                  cursor: "pointer",
                  bgcolor: "#f5f5f5",
                }}
                onClick={() => navigate(`/product-details/${product.id}`)}
              />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="h2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { color: "primary.main" },
                    mb: 1,
                  }}
                  onClick={() => navigate(`/product-details/${product.id}`)}
                >
                  {product.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {product.description?.substring(0, 80)}
                  {product.description?.length > 80 && "..."}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {product.pricing_tiers && product.pricing_tiers.length > 0 ? (
                    <Box>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        From{" "}
                        {formatPrice(Math.min(...product.pricing_tiers.map((t) => t.selling_price || t.sellingPrice)))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Starting price • Bulk discounts available
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(product.price)}
                    </Typography>
                  )}

                  {product.cashback_rate > 0 && (
                    <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 0.5 }}>
                      {product.cashback_rate}% Cashback
                    </Typography>
                  )}
                </Box>

                {renderPricingTiers(product.pricing_tiers)}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto", pt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleAddToCart(product)}
                    sx={{ flexGrow: 1, mr: 1 }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    color={wishlist.some((item) => item.id === product.id) ? "error" : "default"}
                    onClick={() => handleWishlistToggle(product)}
                  >
                    {wishlist.some((item) => item.id === product.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default ProductPage
