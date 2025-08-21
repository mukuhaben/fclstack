"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  Divider,
  LinearProgress,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Business as SupplierIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  GetApp as BatchIcon,
  Timer as TimerIcon,
} from "@mui/icons-material"
import PurchaseOrderForm from "./PurchaseOrderForm"

const PurchaseOrderManagement = () => {
  // State management
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [filteredPOs, setFilteredPOs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPO, setSelectedPO] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [poFormOpen, setPOFormOpen] = useState(false)
  const [editingPO, setEditingPO] = useState(null)
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Initialize sample PO data
  useEffect(() => {
    const samplePOs = [
      {
        id: "PO001",
        poNumber: "PO-2024-001",
        supplier: {
          id: 1,
          name: "Afri Supplies Ltd",
          contact: "John Kamau",
          email: "info@afrisupplies.co.ke",
          phone: "+254 722 123 456",
          categories: ["General Stationery", "Office Supplies"],
        },
        items: [
          {
            id: 1,
            productCode: "L0202004",
            productName: "Afri Multipurpose Labels K11 19*13mm White",
            quantity: 100,
            rate: 45.0,
            taxPercent: 16,
            tax: 720.0,
            amount: 5220.0,
          },
          {
            id: 2,
            productCode: "P0601005",
            productName: "Afri Packing Tape (Brown) 48mm*100Mtr",
            quantity: 50,
            rate: 160.0,
            taxPercent: 16,
            tax: 1280.0,
            amount: 9280.0,
          },
        ],
        orderDate: "2024-06-15",
        dueDate: "2024-06-25",
        status: "pending",
        emailSent: true,
        totals: {
          subtotal: 12500.0,
          totalTax: 2000.0,
          grandTotal: 14500.0,
        },
        createdAt: "2024-06-15T10:30:00Z",
        notes: "Urgent order for restocking",
      },
      {
        id: "PO002",
        poNumber: "PO-2024-002",
        supplier: {
          id: 2,
          name: "KB Stationery Ltd",
          contact: "Mary Wanjiku",
          email: "sales@kbstationery.co.ke",
          phone: "+254 733 987 654",
          categories: ["General Stationery", "Educational Supplies"],
        },
        items: [
          {
            id: 1,
            productCode: "C0201003",
            productName: "Counter Books KB A4 3 Quire REF 233",
            quantity: 200,
            rate: 300.0,
            taxPercent: 16,
            tax: 9600.0,
            amount: 69600.0,
          },
        ],
        orderDate: "2024-06-14",
        dueDate: "2024-06-24",
        status: "sent",
        emailSent: true,
        totals: {
          subtotal: 60000.0,
          totalTax: 9600.0,
          grandTotal: 69600.0,
        },
        createdAt: "2024-06-14T14:15:00Z",
        notes: "Bulk order for schools",
      },
      {
        id: "PO003",
        poNumber: "PO-2024-003",
        supplier: {
          id: 3,
          name: "Office Solutions Kenya",
          contact: "Peter Mwangi",
          email: "orders@officesolutions.co.ke",
          phone: "+254 711 456 789",
          categories: ["Office Automation", "IT Accessories"],
        },
        items: [
          {
            id: 1,
            productCode: "P0401001",
            productName: "Petty Cash Voucher White A6 Ref 283",
            quantity: 500,
            rate: 35.0,
            taxPercent: 16,
            tax: 2800.0,
            amount: 20300.0,
          },
        ],
        orderDate: "2024-06-13",
        dueDate: "2024-06-23",
        status: "delivered",
        emailSent: true,
        totals: {
          subtotal: 17500.0,
          totalTax: 2800.0,
          grandTotal: 20300.0,
        },
        createdAt: "2024-06-13T09:45:00Z",
        notes: "Delivered on time",
      },
    ]

    setPurchaseOrders(samplePOs)
    setFilteredPOs(samplePOs)
  }, [])

  // Filter POs based on search term and status
  useEffect(() => {
    let filtered = purchaseOrders.filter(
      (po) =>
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((po) => po.status === statusFilter)
    }

    setFilteredPOs(filtered)
  }, [purchaseOrders, searchTerm, statusFilter])

  // Handle create new PO
  const handleCreatePO = () => {
    setEditingPO(null)
    setPOFormOpen(true)
  }

  // Handle edit PO
  const handleEditPO = (po) => {
    setEditingPO(po)
    setPOFormOpen(true)
  }

  // Handle view PO details
  const handleViewPO = (po) => {
    setSelectedPO(po)
    setViewDialogOpen(true)
  }

  // Handle save PO
  const handleSavePO = (poData) => {
    if (editingPO) {
      // Update existing PO
      setPurchaseOrders((prev) => prev.map((po) => (po.id === editingPO.id ? { ...poData, id: editingPO.id } : po)))
      showNotification("Purchase Order updated successfully", "success")
    } else {
      // Create new PO
      const newPO = {
        ...poData,
        id: `PO${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setPurchaseOrders((prev) => [newPO, ...prev])
      showNotification("Purchase Order created successfully", "success")
    }
    setPOFormOpen(false)
    setEditingPO(null)
  }

  // Handle batch processing from customer orders
  const handleBatchProcess = async () => {
    setBatchProcessing(true)
    try {
      // Simulate batch processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // This would normally fetch pending customer orders and group them by supplier
      const newBatchPO = {
        id: `PO${Date.now()}`,
        poNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
        supplier: {
          id: 4,
          name: "Batch Supplier Ltd",
          contact: "Auto Generated",
          email: "batch@supplier.com",
          phone: "+254 700 000 000",
          categories: ["General Stationery"],
        },
        items: [
          {
            id: 1,
            productCode: "BATCH001",
            productName: "Batch Processed Item",
            quantity: 25,
            rate: 100.0,
            taxPercent: 16,
            tax: 400.0,
            amount: 2900.0,
          },
        ],
        orderDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending",
        emailSent: false,
        totals: {
          subtotal: 2500.0,
          totalTax: 400.0,
          grandTotal: 2900.0,
        },
        createdAt: new Date().toISOString(),
        notes: "Auto-generated from batch processing",
      }

      setPurchaseOrders((prev) => [newBatchPO, ...prev])
      showNotification("Batch processing completed. New PO generated.", "success")
    } catch (error) {
      showNotification("Error during batch processing", "error")
    } finally {
      setBatchProcessing(false)
    }
  }

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"
      case "sent":
        return "info"
      case "delivered":
        return "success"
      case "cancelled":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
            Purchase Order Management
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<BatchIcon />}
              onClick={handleBatchProcess}
              disabled={batchProcessing}
              sx={{ bgcolor: "#1976d2" }}
            >
              {batchProcessing ? "Processing..." : "Batch Process"}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreatePO} sx={{ bgcolor: "#1976d2" }}>
              Create PO
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />}>
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Batch Processing Progress */}
        {batchProcessing && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimerIcon />
                Processing customer orders and generating purchase orders...
              </Box>
            </Alert>
            <LinearProgress />
          </Box>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#1976d2" }}>
                  {purchaseOrders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total POs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff3e0", border: "1px solid #ffcc02" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#f57c00" }}>
                  {purchaseOrders.filter((po) => po.status === "pending").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e1f5fe", border: "1px solid #b3e5fc" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#0288d1" }}>
                  {purchaseOrders.filter((po) => po.status === "sent").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e8", border: "1px solid #c8e6c9" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#388e3c" }}>
                  {purchaseOrders.filter((po) => po.status === "delivered").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Delivered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search POs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Purchase Orders Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>PO Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPOs.map((po) => (
                <TableRow key={po.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: "monospace" }}>
                      {po.poNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SupplierIcon color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {po.supplier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {po.supplier.contact}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${po.items.length} items`} size="small" color="primary" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(po.totals.grandTotal)}</TableCell>
                  <TableCell>
                    <Chip label={po.status.toUpperCase()} color={getStatusColor(po.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Date(po.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewPO(po)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit PO">
                        <IconButton size="small" onClick={() => handleEditPO(po)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Email">
                        <IconButton size="small" color="primary">
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print PO">
                        <IconButton size="small" color="secondary">
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* PO Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SupplierIcon />
            <Box>
              <Typography variant="h6">Purchase Order Details</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPO?.poNumber}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPO && (
            <Box>
              {/* PO Header Information */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                      Supplier Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography>
                        <strong>Name:</strong> {selectedPO.supplier.name}
                      </Typography>
                      <Typography>
                        <strong>Contact:</strong> {selectedPO.supplier.contact}
                      </Typography>
                      <Typography>
                        <strong>Email:</strong> {selectedPO.supplier.email}
                      </Typography>
                      <Typography>
                        <strong>Phone:</strong> {selectedPO.supplier.phone}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                      Order Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography>
                        <strong>Order Date:</strong> {new Date(selectedPO.orderDate).toLocaleDateString()}
                      </Typography>
                      <Typography>
                        <strong>Due Date:</strong> {new Date(selectedPO.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography>
                        <strong>Status:</strong>{" "}
                        <Chip
                          label={selectedPO.status.toUpperCase()}
                          color={getStatusColor(selectedPO.status)}
                          size="small"
                        />
                      </Typography>
                      <Typography>
                        <strong>Email Sent:</strong>{" "}
                        <Chip
                          icon={selectedPO.emailSent ? <CheckIcon /> : <WarningIcon />}
                          label={selectedPO.emailSent ? "Yes" : "No"}
                          color={selectedPO.emailSent ? "success" : "warning"}
                          size="small"
                        />
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* PO Items */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                  Purchase Order Items
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell>Product Code</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Tax %</TableCell>
                        <TableCell>Tax Amount</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPO.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontFamily: "monospace" }}>{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell>{item.taxPercent}%</TableCell>
                          <TableCell>{formatCurrency(item.tax)}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                {/* Totals */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Box sx={{ minWidth: 300 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{formatCurrency(selectedPO.totals.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography>Total Tax:</Typography>
                      <Typography>{formatCurrency(selectedPO.totals.totalTax)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Grand Total:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedPO.totals.grandTotal)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {selectedPO.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Notes:</strong> {selectedPO.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button variant="contained" startIcon={<EmailIcon />}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* PO Form Dialog */}
      <Dialog open={poFormOpen} onClose={() => setPOFormOpen(false)} maxWidth="lg" fullWidth>
        <PurchaseOrderForm
          po={editingPO}
          onSave={handleSavePO}
          onCancel={() => {
            setPOFormOpen(false)
            setEditingPO(null)
          }}
        />
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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

export default PurchaseOrderManagement
