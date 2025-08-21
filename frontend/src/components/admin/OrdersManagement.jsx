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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Checkbox,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material"
import {
  Visibility as ViewIcon,
  ShoppingCart as BatchIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material"
import { ordersAPI } from "../../services/interceptor.js"

const OrdersManagement = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("[v0] Loading orders from API...")

      const response = await ordersAPI.getAll({
        page: 1,
        limit: 100,
        search: searchTerm,
      })

      if (response.data?.success) {
        console.log("[v0] Orders loaded successfully:", response.data.orders)
        setOrders(response.data.orders || [])
      } else {
        console.error("[v0] Failed to load orders:", response.data?.error)
        setError(response.data?.error || "Failed to load orders")
        // Fallback to empty array if no data
        setOrders([])
      }
    } catch (error) {
      console.error("[v0] Error loading orders:", error)
      setError("Failed to load orders. Please check your connection.")
      // Show message when no data is available
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleBatchOrders = () => {
    if (selectedOrders.length === 0) {
      alert("Please select orders to batch")
      return
    }
    setBatchDialogOpen(true)
  }

  const processBatch = () => {
    // Here you would typically send the selected orders to create purchase orders
    console.log("Processing batch for orders:", selectedOrders)
    alert(`Creating Purchase Orders for ${selectedOrders.length} selected orders`)
    setSelectedOrders([])
    setBatchDialogOpen(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"
      case "processing":
        return "info"
      case "completed":
      case "delivered":
        return "success"
      case "cancelled":
        return "error"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading orders...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Customer Orders
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadOrders} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BatchIcon />}
            onClick={handleBatchOrders}
            disabled={selectedOrders.length === 0}
            color="primary"
          >
            Batch Selected ({selectedOrders.length})
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button variant="outlined" size="small" onClick={loadOrders} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Select customer orders to batch them into Purchase Orders. Similar products will be grouped by supplier and
        category.
      </Alert>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">{orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h4" color="warning.main">
                {orders.filter((o) => o.status === "pending").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Processing
              </Typography>
              <Typography variant="h4" color="info.main">
                {orders.filter((o) => o.status === "processing").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Selected for Batch
              </Typography>
              <Typography variant="h4" color="primary.main">
                {selectedOrders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search orders by customer name, email or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
                  checked={orders.length > 0 && selectedOrders.length === orders.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(orders.map((o) => o.id))
                    } else {
                      setSelectedOrders([])
                    }
                  }}
                />
              </TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!orders || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {error ? "Failed to load orders" : "No orders found in database"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No orders found matching your search.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{order.customerName || "Unknown Customer"}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.customerEmail || "No email"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={(order.status || "unknown").toUpperCase()}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      KSh {(order.totalAmount || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.itemCount || order.items?.length || 0} item(s)</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewOrder(order)} title="View Order Details">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Customer:</Typography>
                  <Typography>{selectedOrder.customerName || "Unknown Customer"}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedOrder.customerEmail || "No email"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Order Date:</Typography>
                  <Typography>
                    {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" mb={2}>
                Order Items:
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name || item.productName || "Unknown Item"}</TableCell>
                          <TableCell align="right">{item.quantity || 0}</TableCell>
                          <TableCell align="right">
                            KSh {(item.price || item.unitPrice || 0).toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            KSh {((item.quantity || 0) * (item.price || item.unitPrice || 0)).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No items found for this order
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box mt={2} textAlign="right">
                <Typography variant="h6">Total: KSh {(selectedOrder.totalAmount || 0).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Batch Processing Dialog */}
      <Dialog open={batchDialogOpen} onClose={() => setBatchDialogOpen(false)}>
        <DialogTitle>Batch Process Orders</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            You are about to create Purchase Orders for {selectedOrders.length} selected customer orders.
          </Typography>
          <Alert severity="info">
            The system will automatically group similar products by supplier and category to optimize procurement.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
          <Button onClick={processBatch} variant="contained" color="primary">
            Create Purchase Orders
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrdersManagement
