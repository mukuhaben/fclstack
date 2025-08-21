"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Badge,
  Tooltip,
  LinearProgress,
  Snackbar,
} from "@mui/material"
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ShoppingCart as OrderIcon,
  Receipt as ReceiptIcon,
  Description as InvoiceIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Business as SupplierIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material"

// Import the form components
import PurchaseOrderForm from "./PurchaseOrderForm"
import InvoiceForm from "./InvoiceForm"

// Tab Panel Component for organizing content
function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

/**
 * SalesManagement Component
 *
 * Comprehensive sales management system that handles:
 * - Purchase Orders (PO) with manual creation
 * - Invoices with full CRUD operations
 * - Customer receipts and order summaries
 * - Automated batch processing
 * - Integration with supplier and inventory systems
 */
const SalesManagement = () => {
  // Tab management state
  const [tabValue, setTabValue] = useState(0)

  // Data state for purchase orders, invoices, and receipts
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [receipts, setReceipts] = useState([])
  const [customerOrders, setCustomerOrders] = useState([])

  // Form dialog states
  const [poFormOpen, setPOFormOpen] = useState(false)
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false)
  const [editingPO, setEditingPO] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(null)

  // View dialog states
  const [selectedPO, setSelectedPO] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [viewPODialogOpen, setViewPODialogOpen] = useState(false)
  const [viewInvoiceDialogOpen, setViewInvoiceDialogOpen] = useState(false)

  // Batch processing state
  const [batchingStatus, setBatchingStatus] = useState("idle")
  const [batchingProgress, setBatchingProgress] = useState(0)
  const [lastBatchTime, setLastBatchTime] = useState(null)

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  /**
   * Initialize sample data and set up automatic batch processing
   */
  useEffect(() => {
    initializeSampleData()

    // Set up automatic batching interval (every 30 minutes in production)
    const batchInterval = setInterval(
      () => {
        processBatchOrders()
      },
      30 * 60 * 1000,
    ) // 30 minutes

    return () => clearInterval(batchInterval)
  }, [])

  /**
   * Initialize sample data for demonstration
   * In production, this would fetch from API endpoints
   */
  const initializeSampleData = () => {
    // Sample customer orders for batch processing
    const sampleOrders = [
      {
        id: "ORD001",
        customerId: "CUST001",
        customerName: "Paw Pack Ltd",
        items: [
          {
            productCode: "L0202004",
            name: "Afri Multipurpose Labels K11 19*13mm White",
            category: "General Stationery",
            supplier: "Afri Supplies Ltd",
            quantity: 1,
            unitPrice: 50.0,
            taxRate: 16,
          },
          {
            productCode: "P0601005",
            name: "Afri Packing Tape (Brown) 48mm*100Mtr",
            category: "General Stationery",
            supplier: "Afri Supplies Ltd",
            quantity: 1,
            unitPrice: 165.0,
            taxRate: 16,
          },
        ],
        orderDate: new Date(),
        status: "pending",
        location: "Westlands",
      },
      {
        id: "ORD002",
        customerId: "CUST002",
        customerName: "ABC School",
        items: [
          {
            productCode: "C0201003",
            name: "Counter Books KB A4 3 Quire REF 233",
            category: "General Stationery",
            supplier: "KB Stationery Ltd",
            quantity: 5,
            unitPrice: 320.0,
            taxRate: 16,
          },
        ],
        orderDate: new Date(),
        status: "pending",
        location: "Parklands",
      },
    ]

    // Sample invoices with comprehensive data
    const sampleInvoices = [
      {
        id: "INV001",
        invoiceNumber: "KRACU0300001581/2",
        customerId: "CUST001",
        customerName: "Paw Pack Ltd",
        customerAddress: "Ring Road Parklands Opp Apollo Centre\nNairobi K 00100\nKenya",
        customerTaxId: "P052296194R",
        customerEmail: "info@pawpack.co.ke",
        customerPhone: "+254 722 123 456",
        invoiceDate: new Date("2024-11-21"),
        deliveryDate: new Date("2024-11-21"),
        dueDate: new Date("2024-12-21"),
        source: "S00004",
        items: [
          {
            productCode: "L0202004",
            description: "Afri Multipurpose Labels K11 19*13mm White",
            quantity: 1,
            unitPrice: 50.0,
            taxRate: 16,
            taxableAmount: 43.1,
            totalAmount: 50.0,
          },
          {
            productCode: "P0601005",
            description: "Afri Packing Tape (Brown) 48mm*100Mtr 701",
            quantity: 1,
            unitPrice: 165.0,
            taxRate: 16,
            taxableAmount: 142.24,
            totalAmount: 165.0,
          },
        ],
        subtotal: 663.78,
        taxAmount: 106.22,
        totalAmount: 770.0,
        paidAmount: 770.0,
        amountDue: 0,
        paymentMethod: "MOBILE MONEY",
        paymentTerms: "Immediate Payment",
        status: "paid",
        createdDate: new Date("2024-11-21"),
      },
    ]

    // Sample purchase orders
    const samplePOs = [
      {
        id: "PO001",
        poNumber: "PO202411210001",
        supplier: {
          id: 1,
          name: "Afri Supplies Ltd",
          contact: "John Kamau",
          email: "info@afrisupplies.co.ke",
          phone: "+254 722 123 456",
        },
        items: [
          {
            productCode: "L0202004",
            productName: "Afri Multipurpose Labels K11 19*13mm White",
            quantity: 100,
            rate: 45.0,
            taxPercent: 16,
            tax: 720.0,
            amount: 5220.0,
          },
        ],
        orderDate: new Date("2024-11-21"),
        dueDate: new Date("2024-12-21"),
        status: "pending",
        totals: {
          subtotal: 4500.0,
          totalTax: 720.0,
          grandTotal: 5220.0,
        },
        createdAt: new Date("2024-11-21"),
      },
    ]

    setCustomerOrders(sampleOrders)
    setInvoices(sampleInvoices)
    setPurchaseOrders(samplePOs)
  }

  /**
   * Process batch orders - groups customer orders by supplier and creates POs
   */
  const processBatchOrders = useCallback(async () => {
    if (batchingStatus === "processing") return

    setBatchingStatus("processing")
    setBatchingProgress(0)
    setLastBatchTime(new Date())

    try {
      // Step 1: Get all pending customer orders
      const pendingOrders = customerOrders.filter((order) => order.status === "pending")

      if (pendingOrders.length === 0) {
        setBatchingStatus("idle")
        showNotification("No pending orders to process", "info")
        return
      }

      setBatchingProgress(20)

      // Step 2: Group items by supplier and category
      const supplierGroups = {}

      pendingOrders.forEach((order) => {
        order.items.forEach((item) => {
          const key = `${item.supplier}_${item.category}`
          if (!supplierGroups[key]) {
            supplierGroups[key] = {
              supplier: item.supplier,
              category: item.category,
              items: [],
              totalQuantity: 0,
              totalValue: 0,
            }
          }

          // Check if item already exists in group
          const existingItem = supplierGroups[key].items.find((groupItem) => groupItem.productCode === item.productCode)

          if (existingItem) {
            existingItem.quantity += item.quantity
            existingItem.totalValue += item.quantity * item.unitPrice
          } else {
            supplierGroups[key].items.push({
              ...item,
              totalValue: item.quantity * item.unitPrice,
            })
          }

          supplierGroups[key].totalQuantity += item.quantity
          supplierGroups[key].totalValue += item.quantity * item.unitPrice
        })
      })

      setBatchingProgress(50)

      // Step 3: Generate Purchase Orders for each supplier group
      const newPurchaseOrders = []

      Object.values(supplierGroups).forEach((group, index) => {
        const poNumber = `PO${Date.now()}${index.toString().padStart(3, "0")}`
        const purchaseOrder = {
          id: poNumber,
          poNumber,
          supplier: {
            name: group.supplier,
            email: `info@${group.supplier.toLowerCase().replace(/\s+/g, "")}.co.ke`,
          },
          category: group.category,
          items: group.items.map((item) => ({
            productCode: item.productCode,
            productName: item.name,
            quantity: item.quantity,
            rate: item.unitPrice,
            taxPercent: item.taxRate,
            tax: (item.quantity * item.unitPrice * item.taxRate) / 100,
            amount: item.quantity * item.unitPrice * (1 + item.taxRate / 100),
          })),
          totalQuantity: group.totalQuantity,
          totalValue: group.totalValue,
          status: "pending",
          createdDate: new Date(),
          orderDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
          emailSent: false,
          totals: {
            subtotal: group.totalValue,
            totalTax: group.totalValue * 0.16, // Assuming 16% tax
            grandTotal: group.totalValue * 1.16,
          },
        }
        newPurchaseOrders.push(purchaseOrder)
      })

      setBatchingProgress(75)

      // Step 4: Send emails to suppliers (simulated)
      for (const po of newPurchaseOrders) {
        await simulateEmailSend(po)
        po.emailSent = true
      }

      setBatchingProgress(90)

      // Step 5: Update states
      setPurchaseOrders((prev) => [...prev, ...newPurchaseOrders])

      // Mark customer orders as processed
      setCustomerOrders((prev) =>
        prev.map((order) =>
          pendingOrders.some((po) => po.id === order.id) ? { ...order, status: "processed" } : order,
        ),
      )

      setBatchingProgress(100)
      setBatchingStatus("completed")
      showNotification(`Successfully created ${newPurchaseOrders.length} purchase orders`, "success")

      // Reset status after 3 seconds
      setTimeout(() => {
        setBatchingStatus("idle")
        setBatchingProgress(0)
      }, 3000)
    } catch (error) {
      console.error("Error processing batch orders:", error)
      setBatchingStatus("error")
      showNotification("Error processing batch orders", "error")
      setTimeout(() => {
        setBatchingStatus("idle")
        setBatchingProgress(0)
      }, 3000)
    }
  }, [customerOrders, batchingStatus])

  /**
   * Simulate email sending to suppliers
   */
  const simulateEmailSend = async (purchaseOrder) => {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(`Email sent to ${purchaseOrder.supplier.name} for PO ${purchaseOrder.poNumber}`)
  }

  /**
   * Show notification to user
   */
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  /**
   * Handle tab change in the main navigation
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  /**
   * Handle manual Purchase Order creation
   */
  const handleCreatePO = () => {
    setEditingPO(null)
    setPOFormOpen(true)
  }

  /**
   * Handle manual Invoice creation
   */
  const handleCreateInvoice = () => {
    setEditingInvoice(null)
    setInvoiceFormOpen(true)
  }

  /**
   * Handle Purchase Order save operation
   */
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

  /**
   * Handle Invoice save operation
   */
  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      // Update existing invoice
      setInvoices((prev) =>
        prev.map((invoice) => (invoice.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : invoice)),
      )
      showNotification("Invoice updated successfully", "success")
    } else {
      // Create new invoice
      const newInvoice = {
        ...invoiceData,
        id: `INV${Date.now()}`,
        createdDate: new Date(),
      }
      setInvoices((prev) => [newInvoice, ...prev])
      showNotification("Invoice created successfully", "success")
    }
    setInvoiceFormOpen(false)
    setEditingInvoice(null)
  }

  /**
   * Handle viewing Purchase Order details
   */
  const handleViewPO = (po) => {
    setSelectedPO(po)
    setViewPODialogOpen(true)
  }

  /**
   * Handle editing Purchase Order
   */
  const handleEditPO = (po) => {
    setEditingPO(po)
    setPOFormOpen(true)
  }

  /**
   * Handle viewing Invoice details
   */
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setViewInvoiceDialogOpen(true)
  }

  /**
   * Handle editing Invoice
   */
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice)
    setInvoiceFormOpen(true)
  }

  /**
   * Format currency values for display
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  /**
   * Get status color for chips
   */
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
      case "paid":
        return "success"
      case "overdue":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header with Manual Creation Buttons */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 3, bgcolor: "#1976d2", color: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                Sales Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                Manage Purchase Orders, Invoices, and Receipts
              </Typography>
            </Box>

            {/* Manual Creation Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreatePO}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Create PO
              </Button>
              <Button
                variant="contained"
                startIcon={<InvoiceIcon />}
                onClick={handleCreateInvoice}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Create Invoice
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Batching Status Indicator */}
        {batchingStatus !== "idle" && (
          <Box sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <TimerIcon color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {batchingStatus === "processing" && "Processing batch orders..."}
                {batchingStatus === "completed" && "Batch processing completed successfully!"}
                {batchingStatus === "error" && "Error in batch processing"}
              </Typography>
              {lastBatchTime && (
                <Typography variant="caption" color="text.secondary">
                  Last batch: {lastBatchTime.toLocaleTimeString("en-US", { hour12: false })}
                </Typography>
              )}
            </Box>
            {batchingProgress > 0 && (
              <LinearProgress variant="determinate" value={batchingProgress} sx={{ borderRadius: 1 }} />
            )}
          </Box>
        )}

        {/* Navigation Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="sales management tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
            },
          }}
        >
          <Tab icon={<OrderIcon />} label="Purchase Orders" />
          <Tab icon={<InvoiceIcon />} label="Invoices" />
          <Tab icon={<ReceiptIcon />} label="Receipts" />
        </Tabs>
      </Paper>

      {/* Purchase Orders Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Controls and Statistics */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    Purchase Order Management
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={processBatchOrders}
                      disabled={batchingStatus === "processing"}
                      sx={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Process Batch Orders
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleCreatePO}
                      sx={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Manual PO
                    </Button>
                  </Box>
                </Box>

                {/* Batch Processing Information */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Automated Batching:</strong> Customer orders are automatically batched every 30 minutes.
                    Similar products are grouped by supplier and category, then purchase orders are generated and
                    emailed to suppliers.
                  </Typography>
                </Alert>

                {/* Statistics Cards */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e3f2fd" }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                        {purchaseOrders.length}
                      </Typography>
                      <Typography variant="body2">Total POs</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fff3e0" }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                        {purchaseOrders.filter((po) => po.status === "pending").length}
                      </Typography>
                      <Typography variant="body2">Pending</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e8f5e8" }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                        {purchaseOrders.filter((po) => po.emailSent).length}
                      </Typography>
                      <Typography variant="body2">Sent</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fce4ec" }}>
                      <Typography variant="h4" color="error.main" sx={{ fontWeight: 600 }}>
                        {customerOrders.filter((order) => order.status === "pending").length}
                      </Typography>
                      <Typography variant="body2">Pending Orders</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Purchase Orders Table */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Poppins', sans-serif" }}>
                  Purchase Orders
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>PO Number</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Total Value</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{po.poNumber}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <SupplierIcon fontSize="small" color="primary" />
                              {po.supplier?.name || po.supplier}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Badge badgeContent={po.items?.length || 0} color="primary">
                              <GroupIcon />
                            </Badge>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {formatCurrency(po.totals?.grandTotal || po.totalValue || 0)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={po.status}
                              color={getStatusColor(po.status)}
                              size="small"
                              icon={po.emailSent ? <CheckIcon /> : <WarningIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            {(po.createdDate || po.createdAt
                              ? new Date(po.createdDate || po.createdAt)
                              : new Date()
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
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
                              <Tooltip title="Print">
                                <IconButton size="small">
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {purchaseOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                            <Typography color="text.secondary">
                              No purchase orders found. Create a manual PO or process batch orders.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Invoices Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    Invoice Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateInvoice}
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Create Invoice
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.customerName}</TableCell>
                          <TableCell>
                            {(invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date()).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              },
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Chip label={invoice.status} color={getStatusColor(invoice.status)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="View Invoice">
                                <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Invoice">
                                <IconButton size="small" onClick={() => handleEditInvoice(invoice)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Print">
                                <IconButton size="small">
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton size="small">
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {invoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                            <Typography color="text.secondary">
                              No invoices found. Click "Create Invoice" to add your first invoice.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Receipts Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Poppins', sans-serif" }}>
                  Customer Receipts
                </Typography>
                <Alert severity="info">
                  Receipt management functionality - Customer receipt order summaries will be displayed here.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Purchase Order Form Dialog */}
      <PurchaseOrderForm
        open={poFormOpen}
        onClose={() => {
          setPOFormOpen(false)
          setEditingPO(null)
        }}
        onSave={handleSavePO}
        editPO={editingPO}
      />

      {/* Invoice Form Dialog */}
      <InvoiceForm
        open={invoiceFormOpen}
        onClose={() => {
          setInvoiceFormOpen(false)
          setEditingInvoice(null)
        }}
        onSave={handleSaveInvoice}
        editInvoice={editingInvoice}
      />

      {/* Purchase Order Details Dialog */}
      <Dialog open={viewPODialogOpen} onClose={() => setViewPODialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Purchase Order Details</Typography>
            <IconButton onClick={() => setViewPODialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPO && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    PO Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedPO.poNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Supplier
                  </Typography>
                  <Typography variant="body1">{selectedPO.supplier?.name || selectedPO.supplier}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Value
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(selectedPO.totals?.grandTotal || selectedPO.totalValue || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={selectedPO.status} color={getStatusColor(selectedPO.status)} size="small" />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedPO.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontFamily: "monospace" }}>{item.productCode}</TableCell>
                        <TableCell>{item.productName || item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.rate || item.unitPrice || 0)}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {formatCurrency(item.amount || item.totalValue || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPODialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<EmailIcon />}>
            Send to Supplier
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={viewInvoiceDialogOpen} onClose={() => setViewInvoiceDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Invoice Details</Typography>
            <IconButton onClick={() => setViewInvoiceDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Company Header */}
              <Box sx={{ textAlign: "center", mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
                  First Craft Ltd
                </Typography>
                <Typography variant="body2">P.O.Box 38869-00623</Typography>
                <Typography variant="body2">Nairobi Kenya</Typography>
                <Typography variant="body2">
                  Email: manager@fcl.co.ke | Website: https://www.fcl.co.ke | KRA Pin: P052130436J
                </Typography>
              </Box>

              {/* Invoice Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bill To:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedInvoice.customerName}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {selectedInvoice.customerAddress}
                  </Typography>
                  <Typography variant="body2">Tax ID: {selectedInvoice.customerTaxId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Invoice {selectedInvoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Invoice Date:</strong>{" "}
                      {(selectedInvoice.invoiceDate
                        ? new Date(selectedInvoice.invoiceDate)
                        : new Date()
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Source:</strong> {selectedInvoice.source}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Items Table */}
              <TableContainer sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f0f0f0" }}>
                      <TableCell>#</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedInvoice.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            [{item.productCode}] {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.quantity} Pc</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{formatCurrency(item.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary */}
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    <strong>Payment terms:</strong> {selectedInvoice.paymentTerms}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Payment Method:</strong> {selectedInvoice.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Invoice Summary
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedInvoice.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Tax Amount:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedInvoice.taxAmount)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Total:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedInvoice.totalAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Paid:</Typography>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(selectedInvoice.paidAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Amount Due:</Typography>
                      <Typography variant="body2" color={selectedInvoice.amountDue > 0 ? "error.main" : "success.main"}>
                        {formatCurrency(selectedInvoice.amountDue)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInvoiceDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
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

export default SalesManagement
