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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Menu,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Card,
} from "@mui/material"
import { Add, Edit, Delete, MoreVert, Visibility, LocalShipping, Business, CalendarToday, AttachMoney } from "@mui/icons-material"
import { adminAPI, productsAPI } from "../../services/interceptor"

const statusColors = {
  pending: { color: "#ff9800", bgcolor: "#fff3e0", label: "Pending" },
  approved: { color: "#2196f3", bgcolor: "#e3f2fd", label: "Approved" },
  delivered: { color: "#4caf50", bgcolor: "#e8f5e8", label: "Delivered" },
  cancelled: { color: "#f44336", bgcolor: "#ffebee", label: "Cancelled" },
}

export default function PurchaseOrderManagement() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State management
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [isAdd, setIsAdd] = useState(true)

  const [formData, setFormData] = useState({
    orderNumber: "",
    supplier: "",
    supplierEmail: "",
    orderDate: "",
    expectedDelivery: "",
    status: "pending",
    totalAmount: "",
    items: [{ productName: "", quantity: "", unitPrice: "", total: 0 }],
  })

  useEffect(() => {
    loadPOs()
  }, [])

  const loadPOs = async () => {
    try {
      const res = await adminAPI.getPurchaseOrders()
      const data = res?.data?.data || res?.data || []
      setPurchaseOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setPurchaseOrders([])
    }
  }

  const generateOrderNumber = () => {
    const year = new Date().getFullYear()
    const orderCount = purchaseOrders.length + 1
    return `PO-${year}-${orderCount.toString().padStart(3, "0")}`
  }

  const handleOpenDialog = (order = null) => {
    if (order) {
      setEditOrder(order)
      setFormData({
        orderNumber: order.orderNumber || order.poNumber || generateOrderNumber(),
        supplier: order.supplier?.name || order.supplier || "",
        supplierEmail: order.supplier?.email || order.supplierEmail || "",
        orderDate: order.orderDate || new Date().toISOString().split("T")[0],
        expectedDelivery: order.expectedDelivery || order.dueDate || "",
        status: order.status || "pending",
        totalAmount: (order.totalAmount || order.totals?.grandTotal || 0).toString(),
        items: (order.items || []).map((it) => ({
          productName: it.productName || it.name || "",
          quantity: it.quantity || 0,
          unitPrice: it.unitPrice || it.rate || 0,
          total: it.total || it.amount || 0,
        })),
      })
      setIsAdd(false)
    } else {
      setEditOrder(null)
      setFormData({
        orderNumber: generateOrderNumber(),
        supplier: "",
        supplierEmail: "",
        orderDate: new Date().toISOString().split("T")[0],
        expectedDelivery: "",
        status: "pending",
        totalAmount: "",
        items: [{ productName: "", quantity: "", unitPrice: "", total: 0 }],
      })
      setIsAdd(true)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditOrder(null)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]
    updatedItems[index][field] = value
    if (field === "quantity" || field === "unitPrice") {
      const quantity = Number.parseFloat(updatedItems[index].quantity) || 0
      const unitPrice = Number.parseFloat(updatedItems[index].unitPrice) || 0
      updatedItems[index].total = quantity * unitPrice
    }
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      totalAmount: updatedItems.reduce((sum, item) => sum + item.total, 0).toString(),
    }))
  }

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { productName: "", quantity: "", unitPrice: "", total: 0 }] }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
        totalAmount: updatedItems.reduce((sum, item) => sum + item.total, 0).toString(),
      }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.supplier || !formData.supplierEmail || !formData.expectedDelivery) {
      setNotification({ open: true, message: "Please fill in all required fields", severity: "error" })
      return
    }

    // Ensure unit price equals product cost price where possible
    const itemsResolved = []
    for (const i of formData.items) {
      if (!i.productName || !i.quantity) continue
      let unitPrice = Number(i.unitPrice) || 0
      if (!unitPrice) {
        try {
          const res = await productsAPI.getAll({ search: i.productName, limit: 1 })
          const product = res?.data?.data?.[0]
          if (product && (product.costPrice || product.cost_price)) {
            unitPrice = Number(product.costPrice || product.cost_price) || 0
          }
        } catch {}
      }
      itemsResolved.push({
        productName: i.productName,
        quantity: Number(i.quantity),
        rate: unitPrice,
      })
    }

    const poPayload = {
      supplier: formData.supplier,
      supplierEmail: formData.supplierEmail,
      orderDate: formData.orderDate,
      dueDate: formData.expectedDelivery,
      items: itemsResolved,
    }

    try {
      if (editOrder) {
        await adminAPI.updatePurchaseOrder(editOrder.id, poPayload)
        setNotification({ open: true, message: "Purchase order updated successfully!", severity: "success" })
      } else {
        await adminAPI.createPurchaseOrder(poPayload, true) // consume virtual stock first
        setNotification({ open: true, message: "Purchase order created successfully!", severity: "success" })
      }
      handleCloseDialog()
      loadPOs()
    } catch (e) {
      setNotification({ open: true, message: "Failed to save purchase order", severity: "error" })
    }
  }

  // Unacknowledged Purchase Orders section
  const [unackedPOs, setUnackedPOs] = useState([])
  const [emailFailedPOs, setEmailFailedPOs] = useState([])

  useEffect(() => {
    const loadUnacknowledged = async () => {
      try {
        const resPending = await adminAPI.getPurchaseOrders({ status: "pending" })
        const dataPending = resPending?.data?.data || resPending?.data || []
        const resSent = await adminAPI.getPurchaseOrders({ status: "sent" })
        const dataSent = resSent?.data?.data || resSent?.data || []
        setUnackedPOs([...(Array.isArray(dataPending) ? dataPending : []), ...(Array.isArray(dataSent) ? dataSent : [])])
        const resFailed = await adminAPI.getPurchaseOrders({ status: "email_failed" })
        const dataFailed = resFailed?.data?.data || resFailed?.data || []
        setEmailFailedPOs(Array.isArray(dataFailed) ? dataFailed : [])
      } catch (e) {
        setUnackedPOs([])
        setEmailFailedPOs([])
      }
    }
    loadUnacknowledged()
  }, [])

  const handleDelete = (order) => {
    setOrderToDelete(order)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      if (orderToDelete) {
        await adminAPI.deletePurchaseOrder(orderToDelete.id)
        setNotification({ open: true, message: "Purchase order deleted successfully!", severity: "success" })
        loadPOs()
      }
    } catch (e) {
      setNotification({ open: true, message: "Failed to delete purchase order", severity: "error" })
    } finally {
      setDeleteConfirmOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleView = (order) => {
    setSelectedOrder(order)
    setViewDialog(true)
  }

  const filteredOrders = purchaseOrders.filter((order) => {
    const poNumber = (order.orderNumber || order.poNumber || "").toLowerCase()
    const supplierName = (order.supplier?.name || order.supplier || "").toLowerCase()
    const matchesSearch = poNumber.includes(searchTerm.toLowerCase()) || supplierName.includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || (order.status || "").toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleActionMenuOpen = (event, order) => {
    setActionMenuAnchor(event.currentTarget)
    setSelectedOrder(order)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setSelectedOrder(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(amount || 0)
  }

  return (
    <Box sx={{ p: 3, maxWidth: "100%", mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            Purchase Order Management
          </Typography>
          <Typography variant="body1" color="text.secondary">Create and manage purchase orders for suppliers</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none", fontWeight: 600, px: 3, py: 1.5, borderRadius: 2 }}>
          Create Purchase Order
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField placeholder="Search orders..." variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 300 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Unacknowledged Purchase Orders */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid #eee" }}>
        <Typography variant="h6" sx={{ mb: 1, color: "#1976d2" }}>Unacknowledged Purchase Orders</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>PO Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Order Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unackedPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No unacknowledged purchase orders</TableCell>
                </TableRow>
              ) : (
                unackedPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>{po.orderNumber || po.poNumber}</TableCell>
                    <TableCell>{po.supplier?.name || po.supplier}</TableCell>
                    <TableCell>{po.orderDate}</TableCell>
                    <TableCell>{po.expectedDelivery || po.dueDate}</TableCell>
                    <TableCell>
                      <Chip label={(po.status || "pending").toUpperCase()} size="small" color={po.status === "sent" ? "info" : "warning"} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {emailFailedPOs.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>Email send failures: {emailFailedPOs.length}</Alert>
        )}
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Order Details</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusKey = (order.status || "pending").toLowerCase()
                const statusConfig = statusColors[statusKey] || statusColors.pending
                return (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="#1976d2">{order.orderNumber || order.poNumber}</Typography>
                        <Typography variant="caption" color="text.secondary">{(order.items || []).length} item(s)</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Business sx={{ mr: 1, color: "#666", fontSize: 18 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{order.supplier?.name || order.supplier}</Typography>
                          <Typography variant="caption" color="text.secondary">{order.supplier?.email || order.supplierEmail}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarToday sx={{ mr: 1, fontSize: 14, color: "#666" }} />
                          <Typography variant="caption">Ordered: {order.orderDate}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocalShipping sx={{ mr: 1, fontSize: 14, color: "#666" }} />
                          <Typography variant="caption">Expected: {order.expectedDelivery || order.dueDate}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AttachMoney sx={{ mr: 1, fontSize: 18, color: "#4caf50" }} />
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(order.totalAmount || order.totals?.grandTotal)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={statusConfig.label} sx={{ bgcolor: statusConfig.bgcolor, color: statusConfig.color, fontWeight: 600, fontSize: "0.75rem" }} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, order)}><MoreVert /></IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem onClick={() => { handleView(selectedOrder); handleActionMenuClose() }}><Visibility sx={{ mr: 1 }} /> View Details</MenuItem>
        <MenuItem onClick={() => { handleOpenDialog(selectedOrder); handleActionMenuClose() }}><Edit sx={{ mr: 1 }} /> Edit</MenuItem>
        <MenuItem onClick={() => { handleDelete(selectedOrder); handleActionMenuClose() }}><Delete sx={{ mr: 1 }} /> Delete</MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {isAdd ? "Create Purchase Order" : "Edit Purchase Order"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                Order Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Number"
                value={formData.orderNumber}
                onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Date"
                type="date"
                value={formData.orderDate}
                onChange={(e) => handleInputChange("orderDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Name *"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Email *"
                type="email"
                value={formData.supplierEmail}
                onChange={(e) => handleInputChange("supplierEmail", e.target.value)}
                required
                helperText="For sending purchase orders"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Delivery *"
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => handleInputChange("expectedDelivery", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Items Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" color="#1976d2">
                  Order Items
                </Typography>
                <Button variant="outlined" size="small" onClick={addItem}>
                  Add Item
                </Button>
              </Box>
            </Grid>

            {formData.items.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Unit Price"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField fullWidth label="Total" value={formatCurrency(item.total)} disabled size="small" />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total Amount: {formatCurrency(Number.parseFloat(formData.totalAmount) || 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isAdd ? "Create Order" : "Update Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Purchase Order Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="#1976d2">
                      Order Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Order Number:</strong> {selectedOrder.orderNumber}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Order Date:</strong> {selectedOrder.orderDate}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Expected Delivery:</strong> {selectedOrder.expectedDelivery}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong>{" "}
                        <Chip
                          label={statusColors[selectedOrder.status].label}
                          size="small"
                          sx={{
                            bgcolor: statusColors[selectedOrder.status].bgcolor,
                            color: statusColors[selectedOrder.status].color,
                          }}
                        />
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="#1976d2">
                      Supplier Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Supplier:</strong> {selectedOrder.supplier}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedOrder.supplierEmail}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="#1976d2">
                      Order Items
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialog(false)
              handleOpenDialog(selectedOrder)
            }}
          >
            Edit Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete purchase order "{orderToDelete?.orderNumber}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
