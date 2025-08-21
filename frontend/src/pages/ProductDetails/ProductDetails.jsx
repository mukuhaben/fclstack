"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Grid,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Drawer,
  Slider,
  Box,
  Card,
  CardMedia,
  Chip,
  Breadcrumbs,
  Link,
  Container,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material"
import {
  GridView,
  ViewList,
  FilterList,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Home as HomeIcon,
  ZoomIn,
  NavigateBefore,
  NavigateNext,
  Close,
} from "@mui/icons-material"
import productService from "../../services/productService.jsx"

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(price)
}

// Updated mockProducts array with placeholder images for build stability
const mockProducts = [
  {
    id: 1,
    name: "Soft Chairs",
    price: 49.99,
    originalPrice: 69.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [{ cashback: 10 }],
  },
  {
    id: 2,
    name: "Sofa Chair",
    price: 89.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [{ cashback: 5 }],
  },
  {
    id: 3,
    name: "Kitchen Dishes",
    price: 39.99,
    originalPrice: 49.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [],
  },
  {
    id: 4,
    name: "Smart Watch",
    price: 99.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [{ cashback: 15 }],
  },
  {
    id: 5,
    name: "Kitchen Mixer",
    price: 59.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [],
  },
  {
    id: 6,
    name: "Blenders",
    price: 34.99,
    originalPrice: 44.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [{ cashback: 5 }],
  },
  {
    id: 7,
    name: "Home Appliance",
    price: 79.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [],
  },
  {
    id: 8,
    name: "Coffee Maker",
    price: 49.99,
    image: "/placeholder.svg?height=120&width=120",
    ranges: [{ cashback: 8 }],
  },
]

const CategoryCard = ({ category }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxShadow: "none",
      border: "1px solid #f0f0f0",
      borderRadius: 2,
      p: 2,
      position: "relative",
      minHeight: 320,
      "&:hover": {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    }}
  >
    {category.ranges?.[0]?.cashback && (
      <Typography
        variant="body2"
        color="white"
        fontWeight="bold"
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          backgroundColor: "red",
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          fontSize: 12,
          fontWeight: 700,
          zIndex: 1,
        }}
      >
        {category.ranges[0].cashback}% Cashback
      </Typography>
    )}

    {/* Fixed image container with consistent height */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 140,
        mt: 4,
        mb: 1,
      }}
    >
      <img
        src={category.image || "/placeholder.svg"}
        alt={category.name}
        style={{
          maxWidth: "100%",
          maxHeight: 120,
          objectFit: "contain",
          margin: "auto",
        }}
      />
    </Box>

    <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ fontSize: "0.65rem" }}>
      Item code: XXXXX
    </Typography>

    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        my: 1,
        fontSize: "0.75rem",
        lineHeight: 1.3,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {category.name} - This is a sample product description.
    </Typography>

    {/* Pricing section with smaller fonts */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 0.5,
        mt: "auto",
      }}
    >
      {[
        { label: "1-3 Pc", price: category.price },
        { label: "4-11 Pc", price: category.price * 1.05 },
        { label: "12+ Pc", price: category.price * 0.95 },
      ].map((tier, idx) => (
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
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.6rem", whiteSpace: "nowrap" }}>
            {tier.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.6rem",
              whiteSpace: "nowrap",
            }}
          >
            {tier.price.toFixed(2)}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
)

const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardMedia
          component="img"
          height="400"
          image="/placeholder.svg?height=400&width=400"
          alt={productName}
          sx={{ objectFit: "cover" }}
        />
      </Card>
    )
  }

  const currentImage = images[selectedImage]

  return (
    <Box>
      {/* Main Image */}
      <Card sx={{ mb: 2, position: "relative" }}>
        <CardMedia
          component="img"
          height="400"
          image={currentImage?.image_url || currentImage}
          alt={productName}
          sx={{
            objectFit: "cover",
            cursor: "zoom-in",
          }}
          onClick={() => setZoomOpen(true)}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255,255,255,0.8)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
          }}
          onClick={() => setZoomOpen(true)}
        >
          <ZoomIn />
        </IconButton>

        {images.length > 1 && (
          <>
            <IconButton
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
              onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
              onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}
      </Card>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <ImageList sx={{ width: "100%", height: 100 }} cols={Math.min(images.length, 4)} rowHeight={100}>
          {images.map((image, index) => (
            <ImageListItem
              key={index}
              sx={{
                cursor: "pointer",
                border: selectedImage === index ? "2px solid #1976d2" : "2px solid transparent",
                borderRadius: 1,
                overflow: "hidden",
              }}
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image?.image_url || image}
                alt={`${productName} ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Zoom Dialog */}
      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">{productName}</Typography>
          <IconButton onClick={() => setZoomOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img
            src={currentImage?.image_url || currentImage}
            alt={productName}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

const ProductDetailsView = ({ product }) => {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [cart, setCart] = useState([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || []
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || []
    setWishlist(storedWishlist)
    setCart(storedCart)
  }, [])

  const handleWishlistToggle = () => {
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

  const handleAddToCart = () => {
    const existingItem = cart.find((item) => item.id === product.id)
    let updatedCart

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
      )
    } else {
      updatedCart = [...cart, { ...product, quantity }]
    }

    setCart(updatedCart)
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))
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
  
  
  const productImages = product.images || product.productImages || []
  const allImages =
    productImages.length > 0
      ? productImages.map((img) => img.image_url || img)
      : product.imageUrl
        ? [product.imageUrl]
        : []

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate("/")}
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate(-1)} sx={{ cursor: "pointer" }}>
          Products
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Image Gallery */}
        <Grid item xs={12} md={6}>
          <ImageGallery images={allImages} productName={product.name} />
        </Grid>

        {/* Product Information */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              SKU: {product.sku}
            </Typography>

            <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
              {product.pricingTiers && product.pricingTiers.length > 0
                ? `From ${formatPrice(Math.min(...product.pricingTiers.map((t) => t.selling_price || t.sellingPrice)))}`
                : formatPrice(product.price || product.costPrice)}
            </Typography>

            {product.cashback_rate > 0 && (
              <Chip label={`${product.cashback_rate}% Cashback`} color="success" sx={{ mb: 2 }} />
            )}

            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            {product.longer_description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.longer_description}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Add to Cart Section */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>Qty</InputLabel>
                <Select value={quantity} onChange={(e) => setQuantity(e.target.value)} label="Qty">
                  {[1, 2, 3, 4, 5, 10, 20, 50].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ flexGrow: 1 }}
              >
                Add to Cart
              </Button>

              <IconButton
                color={wishlist.some((item) => item.id === product.id) ? "error" : "default"}
                onClick={handleWishlistToggle}
                size="large"
              >
                {wishlist.some((item) => item.id === product.id) ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>

            {/* Stock Information */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Stock: {product.stockQuantity || product.stock_quantity || 0} units available
            </Typography>

            {/* Category Information */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip label={product.category?.name || product.category_name} size="small" />
              {product.subcategory?.name && <Chip label={product.subcategory.name} size="small" variant="outlined" />}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Pricing Tiers */}
      {product.pricingTiers && product.pricingTiers.length > 0 && (
        <Box sx={{ mt: 4 }}>{renderPricingTiers(product.pricingTiers)}</Box>
      )}
    </Container>
  )
}

const ProductList = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState("grid")
  const [sort, setSort] = useState("")
  const [page, setPage] = useState(1)
  const [priceRange, setPriceRange] = useState([0, 100])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          const result = await productService.getProduct(productId)
          if (result.success) {
            setProduct(result.data)
          } else {
            setError(result.error || "Failed to fetch product")
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          setError("An unexpected error occurred.")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleViewChange = (newView) => setView(newView)
  const handleSortChange = (e) => setSort(e.target.value)
  const handlePageChange = (event, value) => setPage(value)
  const handlePriceChange = (event, newValue) => setPriceRange(newValue)
  const toggleDrawer = () => setDrawerOpen(!drawerOpen)

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    )
  }

  if (productId && !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Product not found</Typography>
      </Container>
    )
  }

  // If we have a specific product, show product details
  if (product) {
    return <ProductDetailsView product={product} />
  }

  // Otherwise show product list
  return (
    <Box sx={{ p: 2, px: { xs: 2, md: 15 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Button startIcon={<FilterList />} onClick={toggleDrawer} sx={{ display: { xs: "inline-flex", md: "none" } }}>
            Filters
          </Button>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sort} onChange={handleSortChange} label="Sort By">
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" spacing={1} justifyContent={{ xs: "center", sm: "flex-end" }}>
          <IconButton onClick={() => handleViewChange("grid")} color={view === "grid" ? "primary" : "default"}>
            <GridView />
          </IconButton>
          <IconButton onClick={() => handleViewChange("list")} color={view === "list" ? "primary" : "default"}>
            <ViewList />
          </IconButton>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={2} sx={{ display: { xs: "none", md: "block" } }}>
          <Typography variant="h6">Filters</Typography>
          <Typography variant="subtitle2">Price Range</Typography>
          <Slider value={priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" min={0} max={200} />
        </Grid>

        <Grid item xs={12} md={10}>
          <Grid container spacing={2}>
            {mockProducts.map((product) => (
              <Grid item xs={12} sm={6} md={2.4} key={product.id}>
                <CategoryCard category={product} />
              </Grid>
            ))}
          </Grid>

          <Pagination
            count={5}
            page={page}
            onChange={handlePageChange}
            size="small"
            sx={{ display: "flex", justifyContent: "center", mt: 3 }}
          />
        </Grid>
      </Grid>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer} sx={{ display: { md: "none" } }}>
        <Stack sx={{ width: 250, p: 2 }} spacing={2}>
          <Typography variant="h6">Filters</Typography>
          <Typography variant="subtitle2">Price Range</Typography>
          <Slider value={priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" min={0} max={200} />
          <Button variant="contained" onClick={toggleDrawer} fullWidth>
            Apply Filters
          </Button>
        </Stack>
      </Drawer>
    </Box>
  )
}

export default ProductList
