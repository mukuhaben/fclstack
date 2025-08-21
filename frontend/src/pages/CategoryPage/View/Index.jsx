"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Skeleton,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material"
import {
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Search as SearchIcon,
} from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { productsAPI, categoriesAPI } from "../../../services/interceptor.js"

const CategoryPage = () => {
  const { slug, categorySlug, subcategorySlug } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("name")
  const [searchTerm, setSearchTerm] = useState("")
  const [wishlist, setWishlist] = useState([])
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsPerPage = 12

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || []
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || []
    setWishlist(storedWishlist)
    setCart(storedCart)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories
        const categoriesResponse = await categoriesAPI.getAll()
        if (categoriesResponse.data?.success) {
          const categoriesData = categoriesResponse.data.data?.categories || []
          setCategories(categoriesData)
        }

        const apiParams = new URLSearchParams()

        if (subcategorySlug) {
          // Handle subcategory route: /category/:categorySlug/:subcategorySlug
          apiParams.append("categorySlug", categorySlug)
          apiParams.append("subcategorySlug", subcategorySlug)
          console.log("[v0] Using both categorySlug and subcategorySlug:", { categorySlug, subcategorySlug })
        } else if (categorySlug) {
          // Handle category route: /category/:categorySlug (but check if it's actually a subcategory)
          apiParams.append("categorySlug", categorySlug)
          console.log("[v0] Using categorySlug only:", categorySlug)
        } else if (slug) {
          // Legacy route: /category/:slug - could be either category or subcategory
          apiParams.append("subcategorySlug", slug) // Try as subcategory first
          console.log("[v0] Legacy route - trying slug as subcategorySlug:", slug)
        }

        apiParams.append("page", currentPage.toString())
        apiParams.append("limit", productsPerPage.toString())
        if (searchTerm) apiParams.append("search", searchTerm)
        apiParams.append("sortBy", sortBy)

        console.log("[v0] API parameters:", Object.fromEntries(apiParams))

        const productsResponse = await productsAPI.getAll(Object.fromEntries(apiParams))

        console.log("[v0] Products API response for category:", productsResponse)

        if (productsResponse.data?.success) {
          const productsData = productsResponse.data.data || []

          const normalizedProducts = productsData.map((product) => ({
            ...product,
            id: product.id,
            name: product.name,
            description: product.description,
            image:
              product.primaryImage || product.imageUrl || `/placeholder.svg?height=200&width=200&query=product image`,
            price: product.price || 0,
            pricing_tiers: product.pricingTiers || [],
            category: product.category?.name,
            subcategory: product.subcategory?.name,
            stock: product.stockQuantity || 0,
            cashback_rate: product.cashbackRate || 0,
          }))

          setProducts(normalizedProducts)
          setTotalProducts(productsResponse.data.pagination?.total || normalizedProducts.length)
        } else {
          console.warn("[v0] API returned unsuccessful response:", productsResponse.data)
          setProducts([])
          setTotalProducts(0)
        }
      } catch (err) {
        console.error("[v0] Error fetching category data:", err)
        setError("Failed to load category data")
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, categorySlug, subcategorySlug, currentPage, searchTerm, sortBy])

  const currentCategory = React.useMemo(() => {
    if (!categories.length) return null

    if (subcategorySlug) {
      const categoryName = categorySlug.replace(/-/g, " ")
      return categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())
    } else {
      const categoryName = slug.replace(/-/g, " ")
      return categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())
    }
  }, [categories, slug, categorySlug, subcategorySlug])

  const currentSubcategory = React.useMemo(() => {
    if (!subcategorySlug || !currentCategory) return null

    const subcategoryName = subcategorySlug.replace(/-/g, " ")
    return currentCategory.subCategories?.find((sub) => sub.name.toLowerCase() === subcategoryName.toLowerCase())
  }, [currentCategory, subcategorySlug])

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / productsPerPage)

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

  // Handle page changes
  const handlePageChange = (event, value) => {
    setCurrentPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle sort changes
  const handleSortChange = (event) => {
    setSortBy(event.target.value)
    setCurrentPage(1)
  }

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
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



  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card sx={{ height: "100%" }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" width="60%" />
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width={80} height={36} />
        <Skeleton variant="circular" width={40} height={40} />
      </CardActions>
    </Card>
  )

  // Error handling
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            navigate("/")
          }}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>

        {subcategorySlug ? (
          <>
            <Link
              underline="hover"
              color="inherit"
              onClick={(e) => {
                e.preventDefault()
                navigate(`/category/${categorySlug}`)
              }}
              sx={{ cursor: "pointer" }}
            >
              {currentCategory?.name || categorySlug.replace(/-/g, " ")}
            </Link>
            <Typography color="text.primary">
              {currentSubcategory?.name || subcategorySlug.replace(/-/g, " ")}
            </Typography>
          </>
        ) : (
          <Typography color="text.primary">{currentCategory?.name || slug.replace(/-/g, " ")}</Typography>
        )}
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {subcategorySlug
            ? currentSubcategory?.name || subcategorySlug.replace(/-/g, " ")
            : currentCategory?.name || slug.replace(/-/g, " ")}
        </Typography>

        {subcategorySlug && currentSubcategory?.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {currentSubcategory.description}
          </Typography>
        )}

        {!subcategorySlug && currentCategory?.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {currentCategory.description}
          </Typography>
        )}

        <Chip label={`${totalProducts} products found`} color="primary" variant="outlined" />
      </Box>

      {/* Search and filter controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={handleSortChange} label="Sort By">
            <MenuItem value="name">Name A-Z</MenuItem>
            <MenuItem value="-name">Name Z-A</MenuItem>
            <MenuItem value="price">Price Low-High</MenuItem>
            <MenuItem value="-price">Price High-Low</MenuItem>
            <MenuItem value="-createdAt">Newest First</MenuItem>
            <MenuItem value="createdAt">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Products grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array.from({ length: productsPerPage }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <ProductSkeleton />
              </Grid>
            ))
          : products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative", // Added for absolute positioning of cashback badge
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  {product.cashback_rate > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "#d32f2f", // Red color for cashback badge
                        color: "white",
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        zIndex: 2,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      {product.cashback_rate}% Cashback
                    </Box>
                  )}

                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: "cover", cursor: "pointer", bgcolor: "#f5f5f5" }}
                    onClick={() => navigate(`/product-details/${product.id}`)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    {(product.itemCode || product.product_code) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mb: 0.5,
                          fontWeight: 500,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Code: {product.itemCode || product.product_code}
                      </Typography>
                    )}

                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h2"
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": { color: theme.palette.primary.main },
                        mb: 1,
                      }}
                      onClick={() => navigate(`/product-details/${product.id}`)}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        fontSize: "0.85rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description || "No description available"}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      {product.pricing_tiers && product.pricing_tiers.length > 0 ? (
                        <Box>
                                          
                        </Box>
                      ) : (
                        <Typography variant="h6" color="primary" fontWeight="bold" sx={{ fontSize: "1.1rem" }}>
                          {formatPrice(product.price)}
                        </Typography>
                      )}
                    </Box>

                    {renderPricingTiers(product.pricing_tiers)}
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      size="small"
                      
                      onClick={() => handleAddToCart(product)}
                      sx={{
                        flexGrow: 1,
                        mr: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      color={wishlist.some((item) => item.id === product.id) ? "error" : "default"}
                      onClick={() => handleWishlistToggle(product)}
                      sx={{
                        border: "1px solid",
                        borderColor: wishlist.some((item) => item.id === product.id) ? "error.main" : "grey.300",
                        "&:hover": {
                          backgroundColor: wishlist.some((item) => item.id === product.id) ? "error.light" : "grey.100",
                        },
                      }}
                    >
                      {wishlist.some((item) => item.id === product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No data in database
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No products found in this category. Please add products from the admin panel.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Browse All Categories
          </Button>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  )
}

export default CategoryPage
