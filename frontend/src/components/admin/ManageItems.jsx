"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Collapse,
  Grid,
  Card,
  Stack,
  CircularProgress,
} from "@mui/material"
import { Search, Edit, Delete, Visibility, Add, UploadFile as UploadFileIcon } from "@mui/icons-material"
import BulkImportModal from "./BulkImportModal"
import productService from "../../services/productService.jsx"

export default function ManageItems({ onEditItem, onAddNewItem }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)

  const handleOpenBulkImportModal = () => {
    setShowBulkImportModal(true)
  }

  const handleCloseBulkImportModal = () => {
    setShowBulkImportModal(false)
  }

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching products with search term:", searchTerm)

      const result = await productService.getProducts({
        page: 1,
        limit: 100,
        search: searchTerm,
      })

      if (result.success) {
        console.log("[v0] Products fetched successfully:", result.data)
        const products = result.data?.data || result.data?.products || result.data || []
        console.log("[v0] Processed products:", products)

        const normalizedProducts = products.map((product) => ({
          ...product,
          // Ensure consistent field names for display
          name: product.name || product.product_name,
          sku: product.sku || product.product_code,
          stockQuantity: product.stockQuantity || product.stock_quantity || product.stock_units,
          imageUrl: product.imageUrl || product.image_url,
          categoryName: product.category?.name || product.category_name,
          subcategoryName: product.subcategory?.name || product.subcategory_name,
          cashbackRate: product.cashbackRate || product.cashback_rate,
          costPrice: product.price || product.cost_price,
          pricingTiers: product.pricingTiers || product.pricing_tiers || [],
        }))

        setItems(normalizedProducts)
        setError("")

        if (normalizedProducts.length === 0) {
          console.log("[v0] No products found in database")
        }
      } else {
        console.error("Failed to fetch products:", result.error)
        setError(result.error || "Failed to fetch products")
        setItems([]) // Set empty array when fetch fails
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to connect to server. Please check your connection.")
      setItems([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Search products
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== "") {
        fetchProducts()
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Filter items based on search
  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditItem = (item) => {
    if (onEditItem) {
      onEditItem(item)
    }
  }

  const handleDeleteItem = (item) => {
    setSelectedItem(item)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        console.log("Deleting product:", selectedItem.id)

        const result = await productService.deleteProduct(selectedItem.id)
        if (result.success) {
          setItems(items.filter((item) => item.id !== selectedItem.id))
          setSuccessMessage(`Product "${selectedItem.name}" deleted successfully!`)
          setTimeout(() => setSuccessMessage(""), 3000)
          setError("")
        } else {
          console.error("Failed to delete product:", result.error)
          setError(result.error || "Failed to delete product")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        setError("Failed to delete product")
      }
    }
    setDeleteDialog(false)
    setSelectedItem(null)
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setViewDialog(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPricingTiers = (pricingTiers) => {
    if (!pricingTiers || pricingTiers.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No pricing tiers
        </Typography>
      )
    }

    return pricingTiers.map((tier, index) => (
      <Box key={tier.id || index} sx={{ mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
          {tier.min_quantity || tier.minQuantity}-
          {(tier.max_quantity || tier.maxQuantity) === 999 ? "∞" : tier.max_quantity || tier.maxQuantity} units:{" "}
          {formatCurrency(tier.selling_price || tier.sellingPrice)}
        </Typography>
      </Box>
    ))
  }

  const getStockStatus = (stockUnits, alertQuantity) => {
    if (stockUnits <= alertQuantity) {
      return { color: "#f44336", label: "Low", bgcolor: "#ffebee" }
    } else if (stockUnits <= alertQuantity * 2) {
      return { color: "#ff9800", label: "Medium", bgcolor: "#fff3e0" }
    } else {
      return { color: "#4caf50", label: "Good", bgcolor: "#e8f5e8" }
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            Manage Items
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View, edit, and manage your product inventory
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddNewItem}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              mr: 1,
            }}
          >
            Add New Item
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleOpenBulkImportModal}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Bulk Import
          </Button>
        </Box>
      </Box>

      {/* Success Message */}
      <Collapse in={!!successMessage}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Collapse>

      {/* Error Message */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      </Collapse>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search items by name, code, or category..."
          variant="outlined"
          size="medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#666" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: "100%", sm: 400 },
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Items Table - Responsive Design */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer sx={{ width: "100%" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 200 }}>
                  Product
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 80 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 120 }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 140 }}>
                  Price Range
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 80 }}>
                  Cashback
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 100 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333", fontSize: "0.85rem", minWidth: 120 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(
                  item.stockQuantity || item.stock_quantity || 0,
                  item.alert_quantity || 10,
                )
                const pricingTiers = item.pricingTiers || []
                const lowestPrice =
                  pricingTiers.length > 0
                    ? Math.min(...pricingTiers.map((tier) => tier.selling_price || tier.sellingPrice))
                    : 0
                const highestPrice =
                  pricingTiers.length > 0
                    ? Math.max(...pricingTiers.map((tier) => tier.selling_price || tier.sellingPrice))
                    : 0

                return (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8f9fa" },
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={item.imageUrl || "/placeholder.svg?height=40&width=40&query=product image"}
                          sx={{
                            mr: 1.5,
                            width: 40,
                            height: 40,
                            bgcolor: "#f5f5f5",
                            borderRadius: 1,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                            {item.description?.substring(0, 30)}
                            {item.description?.length > 30 ? "..." : ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2", fontSize: "0.8rem" }}>
                        {item.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={/* Use normalized category name */ item.categoryName || "No Category"}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#1976d2",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                        {item.subcategoryName && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                            {item.subcategoryName}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          {formatCurrency(item.costPrice || item.cost_price || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {(item.pricingTiers || item.pricing_tiers || []).length} tiers
                        </Typography>
                        {(item.pricingTiers || item.pricing_tiers || []).length > 0 && (
                          <Typography variant="caption" color="primary" sx={{ fontSize: "0.7rem", display: "block" }}>
                            From{" "}
                            {formatCurrency(
                              Math.min(
                                ...(item.pricingTiers || item.pricing_tiers).map(
                                  (t) => t.selling_price || t.sellingPrice,
                                ),
                              ),
                            )}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${item.cashbackRate || 0}%`}
                        size="small"
                        sx={{
                          bgcolor: "#fff3e0",
                          color: "#f57c00",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={stockStatus.label}
                          size="small"
                          sx={{
                            bgcolor: stockStatus.bgcolor,
                            color: stockStatus.color,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {item.stockQuantity || 0} {item.uom || "units"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewItem(item)}
                          title="View"
                          sx={{
                            color: "#4caf50",
                            "&:hover": { bgcolor: "#e8f5e8" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          title="Edit"
                          sx={{
                            color: "#ff9800",
                            "&:hover": { bgcolor: "#fff3e0" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item)}
                          title="Delete"
                          sx={{
                            "&:hover": { bgcolor: "#ffebee" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* No items message */}
      {!loading && filteredItems.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {items.length === 0 ? "No data in database" : "No items match your search"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {items.length === 0 ? "Add your first product to get started" : "Try adjusting your search terms"}
          </Typography>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: "none", color: "#666" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Item Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <img
                      src={selectedItem.imageUrl || "/placeholder.svg?height=200&width=250&query=product image"}
                      alt={selectedItem.name}
                      style={{
                        width: "100%",
                        maxWidth: "250px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {selectedItem.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    Item Code: <strong>{selectedItem.sku}</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                    {selectedItem.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Pricing Tiers:
                    </Typography>
                    <Card sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                      {(selectedItem.pricingTiers || selectedItem.pricing_tiers || []).length > 0 ? (
                        <Grid container spacing={2}>
                          {(selectedItem.pricingTiers || selectedItem.pricing_tiers).map((tier, index) => (
                            <Grid item xs={12} sm={6} md={4} key={tier.id || index}>
                              <Paper sx={{ p: 2, bgcolor: "white", borderRadius: 1 }}>
                                <Typography variant="subtitle2" fontWeight="600" color="primary" gutterBottom>
                                  Tier {index + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Quantity:</strong> {tier.min_quantity || tier.minQuantity} -{" "}
                                  {(tier.max_quantity || tier.maxQuantity) === 999
                                    ? "∞"
                                    : tier.max_quantity || tier.maxQuantity}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2" }}>
                                  <strong>Price:</strong> {formatCurrency(tier.selling_price || tier.sellingPrice)}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No pricing tiers configured for this product
                        </Typography>
                      )}
                    </Card>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Category:</strong> {selectedItem.categoryName}
                        {selectedItem.subcategoryName && ` > ${selectedItem.subcategoryName}`}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Cashback:</strong> {selectedItem.cashbackRate || 0}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Stock:</strong> {selectedItem.stockQuantity || 0} {selectedItem.uom || "units"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Alert Quantity:</strong> {selectedItem.alert_quantity || 10}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialog(false)} sx={{ textTransform: "none", color: "#666" }}>
            Close
          </Button>
          <Button
            onClick={() => {
              setViewDialog(false)
              handleEditItem(selectedItem)
            }}
            variant="contained"
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Edit Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Modal */}
      <BulkImportModal open={showBulkImportModal} onClose={handleCloseBulkImportModal} />
    </Box>
  )
}
